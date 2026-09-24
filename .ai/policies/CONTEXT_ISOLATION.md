# Context Isolation Policy

Version: 0.1.0

## Core rule

A worker receives the smallest context required to complete exactly one task.

**Do not make a worker smarter by giving it more unrelated documents.**

## Character isolation

For a single-character CG:
- load only that character's approved references and facts;
- do not load any other heroine's reference pack, prose description, wardrobe sheet, or prior CG;
- do not reuse hidden conversational memory about another character.

For a multi-character shot:
- load one separate Character Pack per visible character;
- keep identities explicitly namespaced;
- use only characters listed in the Shot Pack.

## Scene isolation

A CG Artist does not read the whole route. It receives:
- Global Visual Pack;
- relevant Character Pack(s);
- Environment Pack;
- one Shot Pack;
- optional immediate continuity input explicitly named by the Shot Pack.

A Scene Writer does not receive image-generation prompts.

## Fresh-worker rule

Default execution uses a fresh worker/session per task or per tightly coupled micro-batch. Prior worker conversation history is not an input.

A tightly coupled CG sequence may share context only when all are true:
- same scene;
- same visible character set;
- same wardrobe;
- same environment;
- consecutive action;
- explicit sequence ID.

## Forbidden context expansion

Specialist workers must not:
- browse the repo to “learn more” unless their harness allows it;
- read unrelated character files;
- read proposals for inspiration during production;
- import old prompts just because they mention the same character;
- silently merge conflicting facts.

When required data is missing, return BLOCKED with the missing field/source instead of expanding scope.
