# Home — textos (validados y aplicados el 31 oct 2026)

Aplica `.claude/PERSONA.md`. Voz: «we» con el tono de Tom; el manifiesto lo
firma Tom. Solo se listan los campos que cambian; el resto se queda.
Todo es contenido (atributos de los bloques), sin tocar código: se aplica en el
editor y se regenera `tools/content/home.html`.

Criterios de esta página:
- Capítulos **sin número** (`chapterNum` vacío; el componente ya lo admite).
  Quitar los rótulos en mono es cosa del diseño, después.
- El parte del viernes se cuenta **una vez** (manifiesto) y aparece como
  cláusula (tabla) y como entregable (proceso), sin repetir la frase.
- Fuera las cifras decorativas del proceso (`stats` vacío).

---

## home-hero

- **statement**: «A small building company for people who care how their
  house is made. Extensions, lofts and full restorations across north and east
  London.»
  → «We're a small building firm in Islington. We do extensions, lofts,
  basements and whole-house restorations, mostly in old terraced houses within
  twenty minutes of our yard.»
- **headline** (3 líneas, como ahora): «Built square. / Handed over / on time.»
  → «We ring you / before you / ring us.»
- **primaryLabel**: «Request a quote» → «Get a rough price»
- **secondaryLabel**: «See our work» → «See the houses»

## site-ticker (obra en curso)

- **site**: «Elm Row, NW3 — Rear extension» (semana 14 de 22)
  → «Highbury Hill, N5 — Loft conversion» (semana 6 de 12)
  *Elm Row se entregó en noviembre de 2025; no puede estar «on site now».*
- **capacity**: «3 live sites · Next start: March 2027»
  → «6 of 6 sites running · Next start: March 2027»
  *Con tres obras y un tope de seis, la lista de espera no cuadraba. Así se
  ve la regla de las seis obras sin explicarla.*

## manifesto (Tom, firmado)

- **chapter**: «01 — Why Ashlar» → «Why we started»
- **text** (lo de `<em>` va en tono apagado, como ahora):
  «Most people dread hiring a builder. The quote that keeps growing, the phone
  that stops ringing, the site left half-done for weeks. We started Ashlar to be
  the opposite: *one fixed price, one person who answers, and a written report
  every Friday until the keys are yours.*»
  → «I spent fifteen years as a carpenter on other people's jobs, and the
  clients I felt for were the ones left chasing, ringing round on a Thursday to
  find out nobody had been on site since Monday. When Priya and I started on
  our own in 2009, we decided ours would never have to chase. *We'd write
  everything down and send it to them every Friday, before they asked.*»
- **signature**: «Tom Hale & Priya Nair, founders» → «Tom Hale, co-founder»

## standard (las cuatro cláusulas)

- **chapter**: «02 — The Ashlar standard» → «The contract»
- **title**: «Four promises, written / into every contract.»
  → «What we put in writing»
- **lede**: «Not values painted on a wall. Clauses in the contract you sign,
  with what happens if we miss them.»
  → «These four are clauses in every contract we sign, along with what we owe
  you if we break one.»
- **§ 02, detalle**: quitar la coletilla «Whether or not you asked for it.»
  (ya está en el manifiesto) → «Photos, progress against the programme and
  next week's plan, in your inbox by 5pm.»
- Se quedan las filas, la columna «Measure» (es un documento) y la nota al
  pie «If a Friday report is late, £100 comes off your final invoice. It has
  happened twice since 2019.», que es de lo mejor de la web.

## services-list

- **chapter**: «03 — What we build» → «What we build»
- **title**: «Five kinds of job. / We don't do the rest.»
  → «What we build, and roughly what it costs»
  *Responde a la primera pregunta del lector; la frase de los cinco trabajos
  se queda para Services.*

## before-after

- **chapter**: «04 — Before & after» → «Before & after»
- **cambio 03**: «…drained properly for the first time in 100 years.»
  → «…drained properly for the first time in about a hundred years.»
- Se queda el titular «Elm Row, eight months apart.».

## projects-carousel

- **chapter**: «05 — Selected work» → «Selected work»
- **endText** (tras «Since 2009 · 118»): «extensions, lofts, basements and
  restorations across London. Each one with the street, the weeks and the final
  bill.»
  → «houses, every one listed with its street, how long it took and what it
  finally cost.»
- Se queda «Recent builds, by street.»: nombrar las obras por calle es un rasgo
  de la casa.

## case-study

- **summary**: «A Georgian townhouse that had been split into bedsits in the
  1970s, put back together as one family home. New structure hidden behind lime
  plaster, the original stair repaired rather than replaced.»
  → «A Georgian townhouse that had been chopped into bedsits in the 1970s. We
  put it back together as one family home, hid the new steel behind lime
  plaster and repaired the original stair instead of replacing it.»
- **Architect**: «Hale Reid Architects» → «Reid Architects» (compartía apellido
  con Tom; cambiarlo también en la ficha de Gibson Square si sale allí).

## process

- **chapter**: «06 — How it works» → «How it works»
- **title**: «What happens, / step by step.» → «What happens, and when you pay»
- **lede**: «Building work feels complicated because nobody explains it. This
  is exactly what happens on a typical extension: what you do, what we do, and
  when you pay.»
  → «Here's a typical rear extension, from the first visit to the day we hand
  it over, with what we'll need from you along the way and when each payment is
  due.»
- **stats**: «5 steps · 22 weeks, typically · 1 person to call» → (vacío)
- **Paso 1, lede**: «A free first visit, then a proper measured survey. No
  sales pitch, just questions about how you live and what you want to change.»
  → «We come round for an hour, free, and ask a lot of questions about how you
  live and what's driving you mad about the house. If you want to go ahead, we
  come back and measure everything properly.»
- **Paso 2, lede**: «…price every line. The number you sign is the number you
  pay, unless you change your mind.»
  → «We draw it up with your architect, or ours, and Priya prices it line by
  line, so you can see exactly where the money goes before you sign anything.»
- **Paso 3, title**: «We build. You get a report every Friday» → «We build»
- **Paso 3, lede**: «One site manager runs your job from start to finish.
  Every Friday you get photos, progress and anything we need from you.»
  → «One site manager runs your job from the first day to the last, and you get
  their mobile number.»
- **Paso 3, youGet**: «About 14 Friday reports, with photos» → «A report every
  Friday, with photos»
- **Paso 4, lede**: «…write down anything that isn't right. Then we fix it,
  fast.»
  → «We walk round the finished house with you and write down anything that
  isn't right, down to a sticky drawer. Then we come back and fix the lot.»
- **Paso 5, title**: «We stay for ten years» → «We're still around for ten
  years»
- **Paso 5, lede**: «We don't disappear after handover. We call at six and
  twelve months, and if anything structural goes wrong, we come back.»
  → «We ring you at six months and again at a year to ask how the house is
  behaving. If anything structural goes wrong in the next ten years, we come
  back and fix it.»
- **Paso 5, youDo**: «Live in it and enjoy it» → «Enjoy having a kitchen again»
- **helpLink**: «Call Marta on 020 7946 0321, she'll explain it in plain
  English» → «Ring Marta on 020 7946 0321 and she'll talk you through it»
- Se quedan «You pay: Nothing.» y el resto de listas.

## client-story

- **chapter**: «07 — In their words» → «In their words»
- **quote**: solo contracciones: «…before we had even noticed anything…» →
  «…before we'd even noticed anything…». La cita respalda el titular nuevo.
- *Pendiente con las fotos:* la cocina de la foto no es la de Elm Row.

## Pie (Options → Footer; afecta a todas las páginas)

- **footer_cta_eyebrow**: «Start a project» → (vacío)
- **footer_cta_title**: «Let's build something that lasts.» → «Got a house
  that needs work?»
- **footer_cta_label**: «Request a quote» → «Get a rough price»

## Decisión pendiente

- **«Get a rough price» en lugar de «Request a quote»** en todos los botones:
  cabecera, hero, pie y menú móvil. Describe mejor lo que pasa (horquilla al
  momento y llamada de Marta), pero «quote» es la palabra que la gente busca.
  Propuesta: cambiarlo en todos.

---

## Añadido con el diseño (31 oct, Claude con el control)

Cambian la composición y algunos textos; los de arriba siguen valiendo salvo
lo que se dice aquí.

- **Obra en curso**: Highbury Hill, N5 pasa de «Loft conversion, semana 6 de
  12» a **«Rear extension, semana 9 de 22»**, para que cuadre con las fotos
  (albañil del hero, vigas del parte, Dan en obra).
- **Cartel de obra** (hero, en lugar del ticker): «On site now» · Highbury
  Hill, N5 · Rear extension · Week 9 of 22 · Site manager: Dan Okafor ·
  Phone: 07700 900461 · Hours: Mon–Fri, 8am–5.30pm · «Noise, dust or a van in
  your way? Ring Dan first. He’d rather hear it from you.» La línea «6 of 6
  sites running · Next start: March 2027» va bajo los botones.
- **Parte del viernes** (bloque nuevo, voz de Dan en el documento):
  - Titular «This one went to the Barkers at 4.52pm.» · entradilla
    «Highbury Hill, week 9. Shared with their permission, exactly as Dan sent
    it.» · nota «If it had gone out after 5pm, £100 would have come off their
    final invoice. It’s in the contract, and it’s happened twice since 2019.»
    (la mejor frase de la tabla de cláusulas, que sale de la Home).
  - This week: los dos perfiles de acero puestos el martes y firmados por
    building control el jueves; muro trasero apuntalado y con lona.
  - Next week: bricklayers el lunes, cambio de contenedor el miércoles
    (avisados los nº 12 y 16), viguetas el viernes.
  - Decisión antes del miércoles 4 de noviembre: la claraboya.
  - Precio: «£131,200, unchanged since you signed» · despedida «Have a good
    weekend. Dan».
- **Fuera de la Home**: la tabla de cláusulas (standard) y el caso de estudio
  de Gibson Square.
