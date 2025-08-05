#!/usr/bin/env python3
"""
Regenerate Cascading Filters - Complete Update

This script completely regenerates the cascading_filters.json file based on the current
state of korean-words.json after all the data corrections and improvements.

Author: Complete Cascading Filters Regeneration Script
Date: 2025-08-05
"""

import json
from pathlib import Path
from collections import defaultdict


def main():
    """Regenerate cascading filters based on current data."""
    input_file = Path("../data/korean-words.json")
    output_file = Path("../data/cascading_filters.json")

    try:
        with open(input_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading JSON file: {e}")
        return

    words = data.get("words", [])

    print("Regenerating cascading filters based on current data...")
    print(f"Analyzing {len(words)} words...")

    # Count combinations of part of speech and topic
    topic_counts = defaultdict(int)
    parts_of_speech = defaultdict(set)

    for word in words:
        pos = word.get("partOfSpeech", "")
        topic = word.get("topic", "")

        if pos and topic:
            # Add topic to this part of speech
            parts_of_speech[pos].add(topic)
            # Count this combination
            topic_counts[f"{pos}:{topic}"] += 1

    # Create the cascading filters structure
    cascading_filters = {
        "parts_of_speech": {},
        "topic_counts": dict(topic_counts),
        "generation_date": "2025-08-05",
    }

    # Part of speech mappings with Korean names (capitalized)
    pos_korean_names = {
        "noun": "명사",
        "verb": "동사",
        "adjective": "형용사",
        "adverb": "부사",
        "determiner": "관형사",
        "pronoun": "대명사",
        "numeral": "수사",
        "particle": "조사",
        "interjection": "감탄사",
    }

    # Build the parts of speech structure
    for pos, topics in parts_of_speech.items():
        korean_name = pos_korean_names.get(pos, pos)
        display_name = f"{pos.title()} - {korean_name}"

        cascading_filters["parts_of_speech"][display_name] = {
            "topics": sorted(list(topics)),
            "english_name": pos,
            "korean_name": korean_name,
        }

    # Sort parts of speech by English name for consistent ordering
    sorted_pos = {}
    pos_order = [
        "noun",
        "verb",
        "adjective",
        "adverb",
        "determiner",
        "pronoun",
        "numeral",
        "particle",
        "interjection",
    ]

    for pos in pos_order:
        for key, value in cascading_filters["parts_of_speech"].items():
            if value["english_name"] == pos:
                sorted_pos[key] = value
                break

    # Add any remaining parts of speech not in the standard order
    for key, value in cascading_filters["parts_of_speech"].items():
        if key not in sorted_pos:
            sorted_pos[key] = value

    cascading_filters["parts_of_speech"] = sorted_pos

    print(f"✅ Found {len(parts_of_speech)} parts of speech")
    print(f"✅ Found {len(topic_counts)} part-of-speech:topic combinations")

    # Show detailed statistics
    print("\n📊 PARTS OF SPEECH STATISTICS:")
    for pos, topics in parts_of_speech.items():
        total_words = sum(topic_counts.get(f"{pos}:{topic}", 0) for topic in topics)
        print(f"   {pos.title()}: {total_words} words, {len(topics)} topics")

    # Show numeral statistics specifically
    numeral_topics = parts_of_speech.get("numeral", set())
    numeral_count = sum(1 for word in words if word.get("partOfSpeech") == "numeral")

    print("\n🔢 NUMERAL SYSTEM STATISTICS:")
    print(f"   Total numerals: {numeral_count}")
    print(f"   Numeral topics: {len(numeral_topics)}")

    for topic in sorted(numeral_topics):
        count = topic_counts.get(f"numeral:{topic}", 0)
        print(f"   - {topic}: {count} numerals")

    # Save the updated cascading filters
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(cascading_filters, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving file: {e}")
        return

    print("\n✅ Cascading filters completely regenerated!")
    print(f"   Saved to: {output_file}")
    print("   Ready for use with updated Korean numeral system")


if __name__ == "__main__":
    main()
