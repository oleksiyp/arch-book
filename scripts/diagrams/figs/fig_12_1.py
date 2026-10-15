"""Figure 12.1 — the RAG pipeline."""
from dg import Diagram
from registry import figure


@figure
def fig_12_1():
    d = Diagram("fig-12-1", 864, 284, "The RAG pipeline",
                "Data products are chunked, embedded and stored in a hybrid vector and keyword index; a fan's "
                "question is rewritten with the fan's context and searched against that index filtered by the "
                "fan's permissions, and a reranker passes the best three to five of the top-k candidates to the "
                "model, which answers with citations.")
    H = 56
    R1, R2 = 40, 168
    c1, c2 = R1 + H // 2, R2 + H // 2
    SRC, CHK, EMB, IDX, RR = 24, 208, 352, 496, 680
    # ingest row
    d.path([(SRC + 152, c1), (CHK, c1)])
    d.path([(CHK + 112, c1), (EMB, c1)])
    d.path([(EMB + 112, c1), (IDX, c1)])
    # query row
    d.path([(SRC + 152, c2), (CHK, c2)])
    d.path([(CHK + 112, c2), (560, c2), (560, R1 + H)], label="PERMISSION-FILTERED", at=0)
    # retrieval to answer
    d.path([(IDX + 128, c1), (RR, c1)], label="TOP-K")
    d.path([(RR + 72, R1 + H), (RR + 72, R2)], label="BEST 3–5", side="right")
    d.node(SRC, R1, 152, H, "Data products", "policies · orders · FAQs", "store")
    d.node(CHK, R1, 112, H, "Chunking", "semantic units")
    d.node(EMB, R1, 112, H, "Embedding")
    d.node(IDX, R1, 128, H, "Hybrid index", "vector + keyword", "focal")
    d.node(RR, R1, 144, H, "Reranker", "precision", "focal")
    d.node(SRC, R2, 152, H, "Fan's question", None, "input")
    d.node(CHK, R2, 112, H, "Query rewrite", "+ fan's context")
    d.node(RR, R2, 144, H, "Model", "answer with citations")
    d.legend([("input", "Person"), ("store", "Owns data"), ("backend", "Pipeline stage"),
              ("focal", "Where quality is won"), ("arrow:muted", "Flow")])
    return d
