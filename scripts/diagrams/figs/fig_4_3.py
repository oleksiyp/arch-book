"""Figure 4.3: the workhorse topology."""
from dg import Diagram
from registry import figure


@figure
def fig_4_3():
    d = Diagram("fig-4-3", 864, 416, "The workhorse topology",
                "Clients reach a load balancer that spreads requests over stateless service instances, more of "
                "which are added on demand; the instances use a distributed cache and a primary store, and hand "
                "slow or asynchronous work to a queue drained by workers that scale independently.")
    H = 56
    r1, r2, r3 = 48, 136, 224
    CX, LX, IX, SX, WX = 24, 152, 320, 560, 728
    # connectors
    d.path([(CX + 96, 164), (LX, 164)])
    d.path([(LX + 112, 152), (292, 152), (292, 76), (IX, 76)])
    d.path([(LX + 112, 164), (IX, 164)])
    d.path([(LX + 112, 176), (292, 176), (292, 252), (IX, 252)])
    # the tier as a whole (any instance) uses cache, store and queue: leave from the zone, not a box
    d.path([(472, 120), (SX, 120)])
    d.path([(472, 208), (SX, 208)])
    d.path([(416, 296), (416, 328), (SX, 328)], dashed=True, label="ASYNC WORK", at=1)
    d.path([(SX + 136, 328), (WX, 328)])
    # zone and nodes
    d.zone(304, 24, 168, 272, "STATELESS INSTANCES")
    d.node(CX, r2, 96, H, "Clients", "fans · apps", "input")
    d.node(LX, r2, 112, H, "Load balancer", "any instance", "focal")
    d.node(IX, r1, 136, H, "Service instance", "stateless")
    d.node(IX, r2, 136, H, "Service instance", "stateless")
    d.node(IX, r3, 136, H, "More instances", "added on demand", "optional")
    d.node(SX, 92, 136, H, "Distributed cache", "sessions · reads", "store")
    d.node(SX, 180, 136, H, "Primary store", None, "store")
    d.node(SX, 300, 136, H, "Queue", "spikes → schedule", "focal")
    d.node(WX, 300, 120, H, "Workers", "scale independently")
    d.legend([("input", "Clients"), ("backend", "Component"), ("optional", "Added on demand"),
              ("store", "Owns data"), ("focal", "Load-bearing idea"), ("arrow:muted", "Call"),
              ("arrow:muted:dashed", "Async")])
    return d
