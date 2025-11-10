from __future__ import annotations

import httpx
import io
from typing import Optional
import os


class P2PClient:
    """Client for communicating with the Go P2P file sharing backend."""
    
    def __init__(self, base_url: str = "http://localhost:8081"):
        self.base_url = base_url.rstrip("/")
        self._client: Optional[httpx.AsyncClient] = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client
    
    async def close(self):
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    async def start_p2p_network(self) -> bool:
        """Start the P2P network if not already started."""
        try:
            client = await self._get_client()
            response = await client.post(f"{self.base_url}/start")
            return response.is_success
        except Exception as e:
            print(f"Warning: Could not start P2P network: {e}")
            return False
    
    async def check_status(self) -> bool:
        """Check if the Go backend is running."""
        try:
            client = await self._get_client()
            response = await client.get(f"{self.base_url}/status")
            return response.is_success
        except Exception:
            return False
    
    async def upload_file(self, key: str, file_content: bytes) -> bool:
        """Upload a file to the P2P network using the given key."""
        try:
            # Ensure P2P network is started
            await self.start_p2p_network()
            
            client = await self._get_client()
            response = await client.post(
                f"{self.base_url}/files?key={key}",
                content=file_content,
                headers={"Content-Type": "application/octet-stream"}
            )
            return response.status_code == 201
        except Exception as e:
            print(f"Error uploading file to P2P backend: {e}")
            return False
    
    async def download_file(self, key: str) -> Optional[bytes]:
        """Download a file from the P2P network using the given key."""
        try:
            client = await self._get_client()
            response = await client.get(f"{self.base_url}/files?key={key}")
            if response.status_code == 200:
                return response.content
            return None
        except Exception as e:
            print(f"Error downloading file from P2P backend: {e}")
            return None
    
    async def get_file_stream(self, key: str) -> Optional[io.BytesIO]:
        """Get a file as a stream from the P2P network."""
        content = await self.download_file(key)
        if content:
            return io.BytesIO(content)
        return None


# Global instance
_p2p_client: Optional[P2PClient] = None


def get_p2p_client() -> P2PClient:
    """Get the global P2P client instance."""
    global _p2p_client
    if _p2p_client is None:
        from app.core.config import get_settings
        settings = get_settings()
        p2p_url = os.getenv("NOTESHARE_P2P_BACKEND_URL", settings.p2p_backend_url)
        _p2p_client = P2PClient(base_url=p2p_url)
    return _p2p_client

