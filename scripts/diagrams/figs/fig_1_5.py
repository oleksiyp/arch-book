"""Figure 1.5: two honest options for telling three consumers about OrderPlaced.

fig-1-5a (a queue per consumer) and fig-1-5b (one topic, many subscribers) are drawn on
the same canvas with the same lifeline columns, so they compare side by side: queue i in
option A sits exactly above consumer i in option B, and Order sits in the same place.
"""
from html import escape

from dg import Diagram, label_width
from registry import figure
from seqkit import actor, lifeline, activation

W_, H_ = 864, 356
AW = 128                                  # actor width
ORDER, BROKER = 96, 288                   # Order; the topic (option B only)
COLS = (456, 608, 760)                    # queues (A) / consumers (B)
BOTTOM = 296                              # lifelines pass behind the opaque option band
PUB_X = (ORDER + BROKER) // 2             # publish labels: one column, between Order and the topic slot
SUB_X = (BROKER + COLS[0]) // 2           # delivery labels: one column, between topic and first consumer


def _option_band(d, text):
    """The Mermaid 'Note over' as a framed band spanning every actor."""
    x, w = ORDER - AW // 2 - 8, COLS[-1] + AW // 2 + 8 - (ORDER - AW // 2 - 8)
    d.zones.append(f'<rect class="dg-mask" x="{x}" y="92" width="{w}" height="28" rx="4"/>'
                   f'<rect class="dg-frame" x="{x}" y="92" width="{w}" height="28" rx="4"/>'
                   f'<text class="dg-name" x="{x + w // 2}" y="110">{escape(text)}</text>')


def _msg(d, x1, x2, y, text, lx, dashed=False):
    """Horizontal message with its label in a fixed column (lx) instead of mid-span,
    so labels line up and never sit on a lifeline they don't touch."""
    d.path([(x1 + 4, y), (x2 - 4 if dashed else x2 - 1, y)], dashed=dashed)
    d.label_at(text, lx, y, horizontal=True, side="above")


@figure
def fig_1_5a():
    d = Diagram("fig-1-5a", W_, H_, "Option A: a queue per consumer",
                "Order publishes OrderPlaced three times, once into each consumer's own queue, with a payload "
                "tailored to that consumer: ticket fields for notifications, stats fields for analytics and risk "
                "fields for bot screening.")
    lifeline(d, ORDER, 76, BOTTOM)
    for cx in COLS:
        lifeline(d, cx, 76, BOTTOM)
    _option_band(d, "Option A — a queue per consumer")
    activation(d, ORDER, 140, 272)
    for y, cx, text in ((168, COLS[0], "ORDERPLACED · TICKET FIELDS"),
                        (208, COLS[1], "ORDERPLACED · STATS FIELDS"),
                        (248, COLS[2], "ORDERPLACED · RISK FIELDS")):
        _msg(d, ORDER, cx, y, text, PUB_X)
    actor(d, ORDER, AW, "Order", "producer", "focal")
    actor(d, COLS[0], AW, "notif.queue", "queue", "store")
    actor(d, COLS[1], AW, "analytics.queue", "queue", "store")
    actor(d, COLS[2], AW, "botscreen.queue", "queue", "store")
    d.legend([("focal", "Producer"), ("store", "Queue"), ("arrow:muted", "Publish")])
    return d


@figure
def fig_1_5b():
    d = Diagram("fig-1-5b", W_, H_, "Option B: one topic, many subscribers",
                "Order publishes OrderPlaced once, with one shared schema, to the orders topic, which delivers "
                "the same event to every subscriber: Notification, Analytics and Bot Screening.")
    lifeline(d, ORDER, 76, BOTTOM)
    lifeline(d, BROKER, 76, BOTTOM)
    for cx in COLS:
        lifeline(d, cx, 76, BOTTOM)
    _option_band(d, "Option B — one topic, many subscribers")
    activation(d, ORDER, 140, 184)
    activation(d, BROKER, 160, 280)
    _msg(d, ORDER, BROKER, 168, "ORDERPLACED · ONE SCHEMA", PUB_X)
    for y, cx in ((208, COLS[0]), (240, COLS[1]), (272, COLS[2])):
        _msg(d, BROKER, cx, y, "SUBSCRIBE", SUB_X, dashed=True)
    actor(d, ORDER, AW, "Order", "producer", "focal")
    actor(d, BROKER, AW, "orders.topic", "topic", "store")
    actor(d, COLS[0], AW, "Notification", "subscriber", "backend")
    actor(d, COLS[1], AW, "Analytics", "subscriber", "backend")
    actor(d, COLS[2], AW, "BotScreening", "subscriber", "backend")
    d.legend([("focal", "Producer"), ("store", "Topic"), ("backend", "Subscriber"),
              ("arrow:muted", "Publish"), ("arrow:muted:dashed", "Delivery to a subscriber")])
    return d
