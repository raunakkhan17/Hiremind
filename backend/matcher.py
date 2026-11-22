"""
Re-export for top-level matcher import.
Provides calculate_match pure function.
"""
from app.matcher import calculate_match, match_candidate_to_job, EXP_LEVEL_MAP

__all__ = ["calculate_match", "match_candidate_to_job", "EXP_LEVEL_MAP"]
