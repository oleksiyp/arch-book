from dg import Diagram
from registry import figure


@figure
def fig_9_2():
    d = Diagram("fig-9-2", 864, 388, "Anatomy of a data product",
                "Operational events feed the transformation code of the ticket-sales data product, owned by the "
                "Orders team, which publishes a stream port of sales events and a table port of daily aggregates "
                "alongside its contract, SLOs, lineage and docs; dashboards and data science subscribe to the "
                "stream, revenue reporting to the table.")
    # zone
    d.zone(212, 56, 412, 272, "DATA PRODUCT: TICKET-SALES · OWNER: ORDERS TEAM")
    # connectors
    d.path([(176, 164), (236, 164)])
    d.path([(396, 152), (420, 152), (420, 116), (448, 116)])
    d.path([(396, 176), (420, 176), (420, 208), (448, 208)])
    d.path([(600, 104), (652, 104), (652, 56), (704, 56)])
    d.path([(600, 128), (704, 128)])
    d.path([(600, 208), (704, 208)])
    # nodes
    d.node(24, 136, 152, 56, "Operational events", "Chapter 6 backbone", "external")
    d.node(236, 136, 160, 56, "Transformation code", "owned logic", "focal")
    d.node(448, 88, 152, 56, "Port · stream", "sales events", "store")
    d.node(448, 180, 152, 56, "Port · table", "daily aggregates", "store")
    d.node(236, 268, 364, 40, "Contract · SLOs · lineage · docs", None, "optional")
    d.node(704, 32, 136, 48, "Dashboards", None, "input")
    d.node(704, 104, 136, 48, "Data science", None, "input")
    d.node(704, 184, 136, 48, "Revenue reporting", None, "input")
    d.note(772, 260, "subscribe to ports,", anchor="middle")
    d.note(772, 274, "never to tables", anchor="middle")
    d.legend([("external", "Upstream source"), ("focal", "Product code"), ("store", "Output port"),
              ("optional", "Contract · metadata"), ("input", "Consumer"), ("arrow:muted", "Data flow")])
    return d
