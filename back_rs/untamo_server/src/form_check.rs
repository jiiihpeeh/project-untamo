use fuzzy_matcher::FuzzyMatcher;
use fuzzy_matcher::skim::SkimMatcherV2;


pub fn fuzzy(s1: &str, s2: &str) -> i64 {
    let matcher = SkimMatcherV2::default();
    let score = matcher.fuzzy_match(s1, s2);
    score.unwrap_or(0)
}