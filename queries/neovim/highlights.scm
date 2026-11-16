; Keywords
(global_declaration
  [
    "global"
    "persist"
    "locked"
  ] @keyword.modifier)

(global_initialisation
  [
    "global"
    "persist"
    "locked"
  ] @keyword.modifier)

(local_declaration
  "local" @keyword.modifier)

(local_initialisation
  "local" @keyword.modifier)

(execution_modifier) @keyword

(proxy_modifier) @keyword

(resource_usage_expression
  (resource_modifier) @keyword)

[
  "if"
  "elif"
  "else if"
  "else"
  "endif"
] @keyword.conditional

; Punctuation
[
  "["
  "]"
  "("
  ")"
] @punctuation.bracket

(key_condition_statement
  "," @punctuation.delimiter)

(key_run_instruction
  "," @punctuation.delimiter)

(draw_instruction
  "," @punctuation.delimiter)

(drawindexed_instruction
  "," @punctuation.delimiter)

(drawinstanced_dispatch_instruction
  "," @punctuation.delimiter)

(key_assignment_statement
  expression: (_
    "," @punctuation.delimiter))

; Preamble
(namespace_declaration
  [
    (namespace_key) @property
    (namespace) @module
  ])

(conditional_include_statement
  (condition_key) @property)

; Header
(_
  header: (_) @label)

(constants_section
  header: _ @constructor)

(commandlist_section
  header: _ @type)

(commandlist_section
  header: _ @function
  (#lua-match? @function "^\\c\\[\\s*c(ommandlist|ustomshader).+"))

; Keys
(_
  key: (_) @property)

; Key Expression Values
; apparently nvim doesn't have a specific enum variant highlight and @constant gets used instead
(field_expression
  (match_expression_field) @constant)

; Variables
(custom_resource
  [
    (resource_prefix) @label
    "\\" @punctuation.delimiter
    (namespace) @module
    (section_identifier) @attribute
  ])

(resource_pool
  [
    (resource_prefix) @label
    "\\" @punctuation.delimiter
    (namespace) @module
    (section_identifier) @attribute
  ])

(preset_section_identifier
  [
    (preset_prefix)? @label
    "\\" @punctuation.delimiter
    (namespace) @module
    (section_identifier) @variable
  ])

(named_variable
  [
    "$" @variable
    (namespace) @module
    (variable_identifier) @variable
  ])

(pooled_variable
  "$" @operator)

(named_variable
  "\\" @punctuation.delimiter)

[
  (buffer_variable)
  (shader_variable)
  (resource_identifier)
  (shader_identifier)
  (scissor_rectangle)
] @variable.builtin

(property_access_expression
  (resource_property) @property
  !arguments)

(ini_parameter) @variable.parameter.builtin

(regex_replacement) @variable.parameter

(regex_replacement_conditional
  "${" @punctuation.special
  (replacement_identifier) @label
  [
    ":-"
    ":+"
  ] @operator
  ":"? @operator
  "}" @punctuation.special)

; Constants and Terminals
; I'd rather this be enum colored like with helix, but no enum capture exists yet
(_
  fixed_value: (_) @constant)

(setting_statement_value
  (fixed_value) @constant)

(key_setting_statement
  (fixed_key_key_value) @constant)

(key_binding_modifier) @keyword

(resource_type) @type.builtin

(resource_format) @constant

(shader_semantic) @constant

(blend_factor) @keyword

; same note here about enum highlights
[
  (frame_analysis_option)
  (marking_actions_option)
] @constant

(boolean_value) @boolean

(null) @constant.builtin

(string) @string

[
  (path_key_value)
  (file_key_value)
] @string.special.path

(numeric_constant) @number.float

(language_constant) @constant.builtin

(runtime_parameter) @constant.builtin

(integer) @number

(hex_integer) @number

(character_escape) @string.escape

; Functions
(instruction) @function.macro ; just for fun

(builtin_function
  (function_name) @function.builtin)

(callable_commandlist
  [
    (callable_prefix) @function.call
    "\\" @punctuation.delimiter
    (namespace) @module
    (section_identifier) @function.call
  ])

(callable_customshader
  [
    (callable_prefix) @function.call
    "\\" @punctuation.delimiter
    (namespace) @module
    (section_identifier) @function.call
  ])

(property_access_expression
  (resource_property) @function.method.call
  arguments: (_))

(assignment_statement
  (resource_property) @function.method.call
  arguments: (_))

; Operators
"=" @operator

(_
  operator: _ @operator)

(field_expression
  [
    "*"
    "/"
  ] @operator)

; Extras
(comment) @comment

(doc_comment) @comment.documentation

(ERROR) @error
