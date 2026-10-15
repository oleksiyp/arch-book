from dg import Diagram
from registry import figure


@figure
def fig_7_2():
    d = Diagram("fig-7-2", 864, 368, "Edge vs. interior: gateway and mesh",
                "Partners and apps reach the API gateway at the edge, which handles authentication, quotas, "
                "rate limits and canary routing and forwards into the interior; there the BFFs and public API "
                "services call Inventory and Orders east–west, inside the service mesh with mTLS, retries and telemetry.")
    H = 56
    R1, RG, R2 = 80, 140, 200
    # zones
    d.zone(212, 108, 252, 120, "EDGE · NORTH–SOUTH")
    # every service is mesh territory; only the gateway stands at the edge
    d.zone(484, 52, 368, 260, "INTERIOR · EAST–WEST · SERVICE MESH")
    # connectors
    d.path([(148, 168), (228, 168)])
    d.path([(448, 156), (480, 156), (480, 108), (508, 108)])
    d.path([(448, 180), (480, 180), (480, 228), (508, 228)])
    d.path([(660, 108), (704, 108)])
    d.path([(660, 220), (676, 220), (676, 124), (704, 124)])
    d.path([(660, 236), (704, 236)])
    # nodes
    d.node(24, RG, 124, H, "Partners & apps", None, "input")
    d.node(228, RG, 220, H, "Gateway", "authn · quotas · rate limits · canary", "focal")
    d.node(508, R1, 152, H, "BFFs", "Chapter 8")
    d.node(508, R2, 152, H, "Public API services")
    d.node(704, R1, 128, H, "Inventory")
    d.node(704, R2, 128, H, "Orders")
    d.note(668, 292, "mTLS · retries · telemetry between services", anchor="middle")
    d.legend([("input", "Outside callers"), ("focal", "Edge gateway: north–south"),
              ("backend", "Service in the mesh: east–west"), ("arrow:muted", "Call")])
    return d
