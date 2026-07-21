# Course 1: Foundations of Modern Software Architecture

## Description

This course establishes the mental model of a software architect working in the AI/cloud era. Students learn what software architecture actually is — the combination of architectural characteristics, decisions, logical components, and styles — and internalize the first law of architecture: *everything is a trade-off*. The course covers identifying and prioritizing architectural characteristics ("-ilities") from business requirements, thinking in components and modules rather than classes, and capturing significant decisions in Architecture Decision Records (ADRs). Diagramming is taught with the C4 model and diagrams-as-code from day one — there is no UML in this specialization; students communicate architecture the way modern teams actually do.

The course also frames the destination of the whole specialization: today's architect is ultimately building toward *platforms* — systems that other teams build on top of. Every characteristic, decision, and component skill learned here is the raw material for the platform architecture capstone. By the end, students can take an ambiguous product brief, derive its driving characteristics, sketch a first-cut logical architecture in C4, and defend their decisions in ADRs — the loop repeated in every subsequent course.

**Primary sources:** *Fundamentals of Software Architecture* (Richards & Ford), *Head First Software Architecture* (Gandhi, Richards & Ford), *Communication Patterns* (Vozniuk)

## Table of Contents

### Module 1: What Software Architecture Is Today
- Architecture vs. design: a spectrum, not a boundary
- The four dimensions: characteristics, decisions, components, styles
- The two laws of software architecture
- The modern architect's role: hands-on, embedded, platform-minded
- Why this specialization ends at platform architecture

### Module 2: Architectural Characteristics
- Operational, structural, process, and cross-cutting characteristics
- Sourcing characteristics from the domain and the environment
- Security and cost as first-class characteristics (not afterthoughts)
- Limiting characteristics to prevent overengineering
- Measuring characteristics: from intuition to fitness functions (preview)

### Module 3: Modularity and Logical Components
- Modularity, coupling, and cohesion; measuring coupling
- Component-based thinking; workflow and actor/action identification
- Avoiding the entity trap
- Logical vs. physical (deployment) architecture
- Components as future platform building blocks

### Module 4: Communicating Architecture — C4 and ADRs
- The C4 model: context, containers, components, code
- Diagrams-as-code (Structurizr, Mermaid, PlantUML-C4)
- Clarity, notation, and composition: making diagrams that don't lie
- Architecture Decision Records: context, decision, consequences, governance
- Writing for stakeholders: developers, executives, security reviewers

### Module 5: Trade-Off Analysis and First Kata
- Trade-off analysis technique: queue vs. topic worked example
- Risk analysis and risk storming
- The architectural kata format
- Graded kata: brief → characteristics → C4 diagrams → three ADRs
