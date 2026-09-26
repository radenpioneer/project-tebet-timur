# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone with the polling link may participate. The link's distribution is controlled by the authorized organizers. Participants choose one candidate and provide their organizational origin (PW and PD), cadre level, and leadership position. The organizers' authority and the criteria for who may distribute the link are not otherwise specified.

## Product Purpose

Provide a nonofficial aspiration poll about candidates for Chairperson of PP KAMMI. Success means participants can submit and revise a response before closing, and the public can view the agreed vote counts and cross-tabulations during and after the poll.

## Positioning

This is an open-link, nonofficial poll, not an official election or a verification of voter identity or eligibility. Its agreed mechanism allows a browser to revise its response using an anonymous edit token and publishes detailed aggregate results. No stronger market or organizational positioning has been established.

## Operating Context

- The poll opens when the application is available online and closes on 29 October 2026 at 23:59 WIB.
- A response selects one candidate and requires PW, PD, cadre level (AB1, AB2, or AB3), and leadership position/status (Ketua, Sekretaris, Bendahara, Kaderisasi, Ketua Bidang, Ketua Departemen, Staf Bidang, or Non Pengurus).
- Participants may revise a response from the same browser until closing. Clearing browser data or using another browser or device can allow an additional response.
- The public can view candidate totals and cross-tabulations across candidate, PW, PD, cadre level, and leadership position while the poll is open and after it closes. One-vote combinations remain visible; combinations without votes show an empty-data message.
- PW and PD options come from the KAMMI structure API. PD choices depend on the selected PW. The agreed upstream cache duration is six hours; fallback to the last successful response is best-effort with the Workers Cache API, and submission is blocked if no successful list is available.

## Capabilities and Constraints

- The poll does not verify participant identity, cadre status, eligibility, or one vote per person. A token limits editing to a browser token, not to a person.
- The poll must not request direct identity, identity numbers, contact details, or other personal data.
- A random edit token is held in an HttpOnly cookie; only its hash is stored in the database. Edit-token hashes are removed at poll close, after which responses cannot be changed.
- Detailed responses are retained for 90 days after closing and then deleted. Final aggregates across all combinations are retained so public results remain available.
- Application logs must not contain response contents, edit tokens, or cookies. Platform operational metadata may still be available.
- Detailed public cross-tabulations, including cells with one vote, can make individual choices inferable; this was an accepted product decision.
- Candidate data is static in source, one Markdown file per candidate. Frontmatter contains name, origin PW, and origin PD; the stable filename is the candidate ID, the body is an optional description, and filename prefixes determine ordering. Three candidate records are currently present; their descriptions are empty. Treat the source records as the current supplied list and do not invent additional candidates or descriptions.
- The web interface supports submitting or revising a response, loading a prior response in the same browser, and viewing public candidate totals and filterable cross-tabulations. Results refresh periodically while the page is open.
- There is no admin interface for changing candidates, schedule, or categories.
- Confirmed implementation stack: React, Vite, TypeScript, Hono, and Cloudflare Workers.
- The upstream structure API requires a server-side authentication secret. No secret value is recorded in project documentation.
- Poll results are not official election results.

## Evidence on Hand

- Agreed product specification: `.scratch/polling-ketumum-pp-kammi/spec.md`.
- Domain terminology: `CONTEXT.md`.
- Decision on anonymous, editable responses and detailed public results: `docs/adr/0001-anonymous-editable-poll-responses.md`.
- Candidate records currently in source: `src/data/candidates/`. No participant data or result data have been provided. Do not fabricate them.

## Product Principles

- State clearly that the poll is nonofficial and does not verify identity or eligibility.
- Collect only the response fields required by the agreed poll.
- Explain the browser-scoped edit limit and the privacy implications of detailed public results.
- Keep public results available after detailed responses are deleted.
- Use the agreed candidate and organization terminology and do not invent missing source data.
