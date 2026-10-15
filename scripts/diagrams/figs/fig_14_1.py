"""Figure 14.1 — the two planes."""
from html import escape

from dg import Diagram, label_width
from registry import figure


def _focal_zone(d, x, y, w, h, label):
    """A highlighted plane: a zone drawn in the focal treatment (local primitive)."""
    lw = label_width(label)
    d.zones.append(
        f'<rect class="dg-n dg-n-focal" x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>'
        f'<rect class="dg-mask" x="{x + 12}" y="{y - 6}" width="{lw}" height="12" rx="2"/>'
        f'<text class="dg-eyebrow dg-l-accent" x="{x + 12 + lw / 2:g}" y="{y + 3}">{escape(label)}</text>')


@figure
def fig_14_1():
    d = Diagram("fig-14-1", 864, 340, "The two planes of a SaaS platform",
                "The control plane manages tenants through onboarding, tenant identity, config and tiering, "
                "billing and metering, and tenant-aware ops; it provisions, configures and observes the "
                "application plane, which serves the venue-chain tenant, the festival tenant and 500 "
                "self-service venues.")
    _focal_zone(d, 24, 24, 816, 96, "CONTROL PLANE · MANAGES TENANTS")
    d.zone(24, 184, 816, 96, "APPLICATION PLANE · SERVES TENANTS")
    d.path([(432, 120), (432, 184)], kind="accent", label="PROVISIONS · CONFIGURES · OBSERVES",
           side="right")
    for i, name in enumerate(["Onboarding", "Tenant identity", "Config & tiering",
                              "Billing & metering", "Tenant-aware ops"]):
        d.node(48 + i * 156, 48, 144, 48, name)
    for i, name in enumerate(["Venue-chain tenant", "Festival tenant", "500 self-service venues"]):
        d.node(48 + i * 272, 208, 224, 48, name)
    d.legend([("focal", "Control plane (highlighted)"), ("backend", "Capability or tenant"),
              ("arrow:accent", "Manages")])
    return d
