from dg import Diagram
from registry import figure


@figure
def fig_10_2():
    d = Diagram("fig-10-2", 864, 300, "Service-to-service authorization as policy",
                "The API gateway verifies fan and partner tokens and calls Orders, identified as "
                "spiffe://encore/orders, which may reserve with Inventory over mTLS; Sale Gate may only query "
                "Bot Screening for risk; Analytics has no path to Inventory and reads events instead.")
    W, H = 176, 56
    A, B, C = 24, 344, 664
    R1, R2 = 48, 176
    # connectors
    d.path([(A + W, 76), (B, 76)])
    d.path([(B + W, 76), (C, 76)], label="MTLS · MAY RESERVE")
    d.path([(A + W, R2 + 28), (B, R2 + 28)], label="MAY QUERY RISK ONLY")
    d.path([(752, R2), (752, R1 + H)], kind="accent", dashed=True, label="NO PATH · DENIED", side="left")
    # nodes
    d.node(A, R1, W, H, "API Gateway", "fan/partner tokens verified")
    d.node(B, R1, W, H, "Orders", "spiffe://encore/orders")
    d.node(C, R1, W, H, "Inventory")
    d.node(A, R2, W, H, "Sale Gate")
    d.node(B, R2, W, H, "Bot Screening")
    d.node(C, R2, W, H, "Analytics", "reads events instead", "focal")
    d.legend([("backend", "Workload with identity"), ("focal", "Denied caller"),
              ("arrow:muted", "Allowed call"), ("arrow:accent:dashed", "Denied by policy")])
    return d
