import h3

def get_h3_index(latitude: float, longitude: float, resolution: int = 11) -> str:
    """
    Converts GPS coordinates into an Uber H3 Hexagon ID.
    Resolution 11 (~25m diameter) pins down exact road defects.
    """
    return h3.geo_to_h3(latitude, longitude, resolution)