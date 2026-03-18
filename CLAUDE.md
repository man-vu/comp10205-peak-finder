# CLAUDE.md

## Project Overview

**COMP10205 Assignment 1 — Closest Pairs of Local Peaks** (Grade: 100%)

A Java program that analyzes geographic elevation data from text files. It reads a 2D grid of elevation values and performs four analyses:

1. Finds the lowest elevation and its frequency
2. Identifies local peaks above a threshold within an exclusion radius
3. Finds the closest pair(s) of peaks using divide-and-conquer
4. Finds the most common elevation value

## Repository Structure

```
├── src/
│   ├── Assignment1.java      # Main driver — file I/O, all core algorithms
│   ├── Peak.java             # Data model for a single peak (row, col, elevation)
│   ├── PeakPair.java         # Data model for a pair of peaks with distance calc
│   ├── ClosestPairs.java     # Container managing closest peak pairs list
│   ├── ELEVATIONS.TXT        # Production dataset (600×1250 grid, 750K values)
│   └── Sample.TXT            # Small test dataset (10×10 grid)
├── out/                      # Compiled .class files
├── README.md                 # Assignment specification
├── Assignment_1_Outline.pdf  # Original assignment PDF
└── Comp10205_Assignment1.iml # IntelliJ IDEA project config
```

## Language and Build

- **Language:** Java (JDK 21)
- **IDE:** IntelliJ IDEA
- **Build:** Standard `javac` compilation (no Maven/Gradle)
- **Dependencies:** None — pure Java Standard Library only (`java.io`, `java.util`)
- **Constraint:** Arrays only — no ArrayLists or other collections (per assignment rules)

### Compiling and Running

```bash
# From project root
javac -d out/production/Comp10205_Assignment1 src/*.java
cd out/production/Comp10205_Assignment1
java -cp .:../../../src Assignment1
```

The program expects data files at paths relative to the working directory (configured via `FILENAME` constant in `Assignment1.java`).

## Key Architecture

### Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `Assignment1.java` | 340 | Main class with all algorithms. Constants at top control dataset selection. |
| `Peak.java` | 59 | Immutable peak model. Implements `Comparable<Peak>` (sorts by column for divide-and-conquer). |
| `PeakPair.java` | 77 | Pair of peaks with static + instance Euclidean distance calculation. |
| `ClosestPairs.java` | 90 | Accumulator for closest pairs. Resets list when a shorter distance is found. Deduplicates entries. |

### Core Algorithms

- **Local Peak Detection** (`findLocalPeaksCompleteSearch`): Complete search excluding border rows/columns. Early termination on finding a higher neighbor. Skips ahead by `exclusionRadius + 1` after finding a peak.
- **Closest Pairs** (`findClosestPairsOptimized` → `findingClosestHelper`): Divide-and-conquer, O(n(log n)²). Falls back to brute force for ≤3 peaks. Uses strip processing with column-sorted peaks.
- **Frequency Analysis** (`mostFrequent`, `lowestElevation`): Single-pass hashing via frequency array indexed by elevation value. O(n) time, O(elevation_range) space.

### Constants (in Assignment1.java)

```java
PEAK_NOMINATED_VALUE = 98480    // Minimum elevation to consider as peak candidate
FILENAME = "src/ELEVATIONS.TXT" // Input data file path
MAXIMUM_POSSIBLE_ELEVATION = 99000
MINIMUM_POSSIBLE_ELEVATION = 15000
```

Commented-out constants exist for switching to the small sample dataset (`Sample.TXT` with values 1–99).

## Data File Format

Line 1: `<rows> <columns> <exclusion_radius>` (space-separated integers)
Lines 2+: Space-separated integer elevation values, row by row.

## Testing

No formal test framework (JUnit, etc.). Validation is done by:
- Running against `Sample.TXT` (10×10, known expected output from assignment spec)
- Running against `ELEVATIONS.TXT` (600×1250, production dataset)
- Switching datasets by toggling commented constants in `Assignment1.java`

## Performance

- Execution time is printed in microseconds, milliseconds, and seconds
- Target: complete in under 2 seconds on the production dataset
- The divide-and-conquer approach avoids the O(n²) brute-force memory issues on large grids

## Conventions

- All source files have author/student header comments
- Methods have Javadoc comments describing purpose and parameters
- No external dependencies — everything uses Java standard arrays
- Git history is minimal (2 commits on master)
