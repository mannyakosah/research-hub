# The problem

A tire-shop rig changes, balances, and inspects tires in a real service bay. Researchers turn sensor data into a small set of numbers. Those numbers drive the rig.

## What is happening today

Researchers run their own experiments. They sometimes start from the same code, then diverge into separate repositories. MATLAB shows up in experiments. A result that looks good gets ported to Python and packaged into a wheel the production app imports.

Around the code, each experiment accumulates extra material: documents, drive files, notes, media. Nothing ties the repository, the files, and the decision to ship into one record.

Some of the evidence comes from real shops. Technicians who did not write the algorithm help set up sensors and record values. Those observations need to come back into the investigation. Today that handoff depends on someone remembering to write things down and send them afterward.

## The two gaps

**Research to production.** There is no shared lifecycle. An algorithm can be ready in a researcher's folder and still be a manual port into production. Versions, tests, and the exact artifact production runs are easy to lose track of.

**The shop run.** A run at a shop produces measurements, photos, video, and setup notes. Those files are part of the result. If capturing them is a second job after the visit, it will not happen reliably. The person recording the run is often not the person who designed the algorithm, so the record has to be structured before they start.

## The response

One place where algorithms, investigations, files, and runs are tracked. An explicit contract so experimental code can be validated and packaged. Git, review, tests, and CI around that boundary. Researchers keep their own tools inside the investigation. The hub standardizes the edges.

An algorithm is one part of the rig, with one repository and released versions. An investigation is the current question on that algorithm, with its files and shop runs. A released version is what production consumes. Shop runs use a standard form so a technician can record them.
