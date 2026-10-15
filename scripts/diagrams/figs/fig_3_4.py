"""Figure 3.4: the strangler fig and its routing facade."""
from dg import Diagram
from registry import figure


@figure
def fig_3_4():
    d = Diagram("fig-3-4", 720, 292, "The strangler fig",
                "Users reach the system through a routing facade, which sends the extracted capability to the "
                "new Admission service and everything else to the legacy monolith, while the new service "
                "reads and writes legacy data through an anticorruption layer.")
    W, H = 176, 56
    U, F, N = 24, 200, 520
    r1, r2 = 48, 176
    # connectors
    d.path([(U + 120, 76), (F, 76)])
    d.path([(F + 152, 76), (N, 76)], kind="accent", label="EXTRACTED CAPABILITY")
    d.path([(276, r1 + H), (276, 204), (N, 204)], label="EVERYTHING ELSE", at=1)
    d.path([(N + W // 2, r1 + H), (N + W // 2, r2)], dashed=True, label="READS/WRITES VIA ACL", side="left")
    # nodes
    d.node(U, r1, 120, H, "Users", None, "input")
    d.node(F, r1, 152, H, "Routing facade", "routing rules", "focal")
    d.node(N, r1, W, H, "New Admission service", "extracted")
    d.node(N, r2, W, H, "Legacy monolith", "shrinking")
    d.legend([("input", "People"), ("focal", "Routing facade"), ("backend", "Component"),
              ("arrow:accent", "Moved capability"), ("arrow:muted:dashed", "Data access via ACL")])
    return d
