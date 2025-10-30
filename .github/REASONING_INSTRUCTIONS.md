# Reasoning-First AI Agent Instructions

## Purpose

This file mandates that any AI agent, regardless of model version (including GPT-4.1), must apply explicit, step-by-step reasoning when responding to prompts in this project.

## Policy

- **Reasoning is Required:**  
  All responses must demonstrate clear, logical reasoning. The agent must not simply provide answers or code, but must show the thought process, trade-offs, and rationale behind each step or recommendation.

- **Step-by-Step Approach:**  
  For every non-trivial prompt, the agent must:
  1. Break down the problem into smaller parts.
  2. Explain the approach and alternatives considered.
  3. Justify the chosen solution or plan.
  4. Only then proceed to implementation or direct answers.

- **No Blind Execution:**  
  The agent must never execute or suggest changes without first explaining the reasoning, even if the task seems obvious.

- **Model-Agnostic:**  
  These instructions apply to all AI models and agents, including but not limited to GPT-4.1, GPT-5, and any future versions.

## Example

**Prompt:**  
> Add a new API endpoint for event RSVPs.

**Required Response:**  
1. *Reasoning:*  
   - The RSVP feature needs to associate members with events.
   - We should check if a similar endpoint exists to avoid duplication.
   - The endpoint should validate input, update the datastore, and return a confirmation.
2. *Plan:*  
   - Add DTOs for RSVP.
   - Update mock data and service.
   - Add controller method.
   - Write tests for edge cases.
3. *Implementation:*  
   - (Code and file changes...)

## Enforcement

- Any agent or model that does not follow this reasoning-first approach is considered out of compliance with project standards.
- Reviewers should reject PRs or outputs that do not include clear reasoning steps.
