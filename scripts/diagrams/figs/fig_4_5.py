"""Figure 4.5: the circuit breaker's three states."""
from dg import Diagram
from registry import figure


@figure
def fig_4_5():
    d = Diagram("fig-4-5", 864, 344, "The circuit breaker's three states",
                "A circuit breaker starts Closed and trips to Open when failures exceed a threshold; while Open, "
                "calls fail instantly so no threads are parked and the dependency gets air; after a cool-down it "
                "goes Half-open, where a probe that succeeds closes it and a probe that fails opens it again.")
    W, H = 160, 56
    CL, HO, OP = 80, 304, 528          # x of Closed, Half-open, Open
    r1, r2 = 64, 208
    d.start(40, 92)
    d.path([(46, 92), (CL, 92)])
    d.path([(CL + W, 92), (OP, 92)], kind="accent", label="FAILURES > THRESHOLD")
    d.path([(592, r1 + H), (592, 224), (HO + W, 224)], label="COOL-DOWN ELAPSES", at=0, side="left")
    d.path([(HO + W, 248), (640, 248), (640, r1 + H)], label="PROBE FAILS", at=1, side="right")
    d.path([(HO, 236), (160, 236), (160, r1 + H)], label="PROBE SUCCEEDS", at=0, side="above")
    d.state(CL, r1, W, H, "Closed", "calls flow")
    d.state(OP, r1, W, H, "Open", "fail fast", "focal")
    d.state(HO, r2, W, H, "Half-open", "trial calls")
    d.note(704, 82, "calls fail instantly")
    d.note(704, 96, "no threads parked")
    d.note(704, 110, "dependency gets air")
    d.legend([("start", "Start"), ("backend", "State"), ("focal", "Where the breaker protects"),
              ("arrow:accent", "Trip"), ("arrow:muted", "Transition: event")])
    return d
