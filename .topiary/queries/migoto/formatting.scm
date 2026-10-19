; header
(_
  header: (_
    (_) @prepend_antispace @append_antispace) @prepend_antispace @append_empty_softline)

; sections
((section) @prepend_delimiter
  (#delimiter! "\n\n"))

(section
  body: (_) @prepend_empty_softline)

(preamble) @prepend_empty_softline

; operators
(_
  "=" @prepend_space @append_space)

; statements
[
  (setting_statement)
  (local_declaration)
  (local_initialisation)
  (assignment_statement)
  (global_declaration)
  (global_initialisation)
  (key_setting_statement)
  (key_condition_statement)
  (key_assignment_statement)
  (key_run_instruction)
  (preset_setting_statement)
  (preset_assignment_statement)
  (shader_regex_setting_statement)
  (instruction_statement)
  (if_statement)
  (elseif_statement)
  (else_statement)
  (namespace_declaration)
  (conditional_include_statement)
] @prepend_empty_softline

(conditional_statement) @allow_blank_line_before

; expressions
(key_setting_statement
  value: (key_binding_expression
    (_) @append_space
    .
    (_)))

(setting_statement_value
  (key_binding_expression
    (_) @append_space
    .
    (_)))

(setting_statement_value
  (blend_expression
    (_) @append_space
    .
    (_)))

(setting_statement_value
  (frame_analysis_option_list
    (_) @append_space
    .
    (_)))

(setting_statement_value
  (marking_actions_option_list
    (_) @append_space
    .
    (_)))

(analysis_instruction
  (frame_analysis_option_list
    (_) @append_space
    .
    (_)))

(dump_instruction
  (dump_instruction_value_list
    (_) @append_space
    .
    (_)))

(setting_statement_value
  (resource_data_array_expression
    .
    (resource_format)?
    (numeric_constant)
    .
    (numeric_constant))) @leaf

(resource_usage_expression
  (_) @append_space
  .
  (_))

(shader_regex_setting_statement
  (free_text) @append_space
  .
  (free_text))

(setting_statement_value
  (fixed_value) @append_space
  .
  (fixed_value))

(binary_expression
  operator: _ @prepend_space @append_space)

(unary_expression
  operator: _ @prepend_space)

; misc.
(block) @prepend_empty_softline

(_
  condition: (operational_expression) @append_empty_softline)

"else" @append_empty_softline

; modifier keywords
(global_declaration
  [
    "global"
    "persist"
  ] @append_space @lower_case)

(global_initialisation
  [
    "global"
    "persist"
  ] @append_space @lower_case)

(local_declaration
  "local" @append_space @lower_case)

(local_initialisation
  "local" @append_space @lower_case)

(execution_modifier) @append_space

; indents
"if" @lower_case @append_indent_start @append_space

[
  "elif"
  "else if"
] @lower_case @append_indent_start @prepend_indent_end

[
  "elif"
  "else if"
] @append_space

"else" @lower_case @append_indent_start @prepend_indent_end

"endif" @lower_case @prepend_indent_end @prepend_empty_softline

; extras
[
  (runtime_parameter)
  (resource_format)
] @upper_case

(comment) @leaf @allow_blank_line_before @prepend_empty_softline

(string) @leaf

(shader_regex_pattern_section
  body: (_) @leaf)

(shader_regex_replace_section
  body: (_) @leaf)

(shader_regex_declarations_section
  body: (_) @leaf)

("," @append_space
  .
  (_))
