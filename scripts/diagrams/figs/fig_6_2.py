"""Figure 6.2: CQRS fed by an event log."""
from dg import Diagram
from registry import figure


@figure
def fig_6_2():
    d = Diagram("fig-6-2", 864, 320, "CQRS fed by an event log",
                "Commands reach the write model, the EventSeating aggregate, which appends events to an event "
                "store that is read as a stream; three projections (the seat-map view, the sales dashboard and "
                "the fan's tickets) are built from that stream and answer queries.")
    H = 56
    r1, r2, r3 = 24, 112, 200
    CX, WX, LX, PX, QX = 24, 152, 416, 584, 752
    # connectors
    d.path([(CX + 96, 140), (WX, 140)])
    d.path([(WX + 144, 140), (LX, 140)], kind="accent", label="EVENTS · THE TRUTH")
    d.path([(LX + 120, 128), (560, 128), (560, 52), (PX, 52)])
    d.path([(LX + 120, 140), (PX, 140)])
    d.path([(LX + 120, 152), (560, 152), (560, 228), (PX, 228)])
    d.path([(PX + 128, 52), (732, 52), (732, 128), (QX, 128)])
    d.path([(PX + 128, 140), (QX, 140)])
    d.path([(PX + 128, 228), (732, 228), (732, 152), (QX, 152)])
    # nodes
    d.node(CX, r2, 96, H, "Commands", "writes in", "input")
    d.node(WX, r2, 144, H, "Write model", "EventSeating aggregate")
    d.node(LX, r2, 120, H, "Event store", "→ stream", "focal")
    d.node(PX, r1, 128, H, "Seat-map view", "projection", "store")
    d.node(PX, r2, 128, H, "Sales dashboard", "projection", "store")
    d.node(PX, r3, 128, H, "Fan's tickets", "projection", "store")
    d.node(QX, r2, 88, H, "Queries", "reads out", "input")
    d.legend([("input", "Commands · queries"), ("backend", "Write model"), ("focal", "System of record"),
              ("store", "Projection: disposable"), ("arrow:accent", "Events appended"), ("arrow:muted", "Flow")])
    return d
