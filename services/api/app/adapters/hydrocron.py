import httpx
import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

HYDROCRON_BASE_URL = os.environ.get("HYDROCRON_BASE_URL", "https://soto.podaac.earthdatacloud.nasa.gov/hydrocron/v1/timeseries")
HYDROCRON_TIMEOUT = int(os.environ.get("HYDROCRON_TIMEOUT_SECONDS", "30"))

class HydrocronAdapter:
    def __init__(self, base_url: str = HYDROCRON_BASE_URL):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=HYDROCRON_TIMEOUT)
        
    async def check_health(self) -> bool:
        """Ping the hydrocron service or a small metadata endpoint to check live status."""
        try:
            check_url = self.base_url.replace('/v1/timeseries', '')
            response = await self.client.get(check_url, timeout=5.0)
            return response.status_code < 500
        except Exception as e:
            logger.error(f"Hydrocron health check failed: {e}")
            return False

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True
    )
    async def _fetch_page(self, url: str, params: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"Fetching Hydrocron data from {url}")
        response = await self.client.get(url, params=params)
        response.raise_for_status()
        return response.json()

    async def fetch_reach_timeseries(
        self, 
        feature_id: str, 
        start_time: datetime, 
        end_time: datetime,
        fields: str = "wse,width,slope2"
    ) -> List[Dict[str, Any]]:
        """Fetch SWOT reach observations from Hydrocron."""
        params = {
            "feature": "Reach",
            "feature_id": feature_id,
            "start_time": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end_time": end_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "output": "json",
            "fields": fields
        }
        
        results = []
        url = self.base_url
        
        try:
            # Handle potential pagination via 'next' links or looping
            while url:
                data = await self._fetch_page(url, params)
                page_results = data.get("results", [])
                
                # Hydrocron returns dict of lists inside 'results'. e.g. results: [{"wse": [..]}]
                # Or sometimes results is a flat list. We will just append the raw results and process later.
                if isinstance(page_results, list):
                    results.extend(page_results)
                else:
                    results.append(page_results)
                
                # Check for next page URL in the JSON response or header if Hydrocron implements it
                # For now, Hydrocron v1 returns all within the requested range, so we break immediately
                # but allow the structure for future Next tokens.
                next_url = data.get("next")
                if next_url:
                    url = next_url
                    params = {} # params are usually encoded in the next_url
                else:
                    break
                    
            return results
        except Exception as e:
            logger.error(f"Failed to fetch from Hydrocron for reach {feature_id}: {e}")
            raise
            
    async def close(self):
        await self.client.aclose()
