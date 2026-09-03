# ADR-006: Dependency strategy

Base `registry:style` installs the "base trio" (`foldkit`, `effect`, `@foldkit/ui`) plus `cn`, `tw-animate-css`. Individual `registry:ui` items only declare extra deps they need beyond the base (e.g., `lucide` for icons). Avoids version conflicts and redundant installs.
