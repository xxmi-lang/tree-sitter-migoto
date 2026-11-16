; Keywords
(global_declaration
  [
    "global"
    "persist"
    "locked"
  ] @keyword)

(global_initialisation
  [
    "global"
    "persist"
    "locked"
  ] @keyword)

(local_declaration
  "local" @keyword)

(local_initialisation
  "local" @keyword)

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
] @keyword

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
    (namespace) @variant
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
  (#match? @function "(?i)^\\[\\s*c(ommandlist|ustomshader).+"))

; Keys
(_
  key: (_) @property)

; Key Expression Values
(field_expression
  (match_expression_field) @enum)

; Variables
(custom_resource
  [
    (resource_prefix) @label
    "\\" @punctuation.delimiter
    (namespace) @variant
    (section_identifier) @attribute
  ])

(resource_pool
  [
    (resource_prefix) @label
    "\\" @punctuation.delimiter
    (namespace) @variant
    (section_identifier) @attribute
  ])

(preset_section_identifier
  [
    (preset_prefix)? @label
    "\\" @punctuation.delimiter
    (namespace) @variant
    (section_identifier) @variable
  ])

(named_variable
  [
    "$" @variable
    (namespace) @variant
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
] @variable.special

(property_access_expression
  (resource_property) @property
  !arguments)

(ini_parameter) @variable.parameter

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
(_
  fixed_value: (_) @enum)

(setting_statement_value
  (fixed_value) @enum)

(key_setting_statement
  (fixed_key_key_value) @enum)

(key_binding_modifier) @keyword

(resource_type) @type.builtin

(resource_format) @enum

(shader_semantic) @enum

(blend_factor) @keyword

[
  (frame_analysis_option)
  (marking_actions_option)
] @enum

(boolean_value) @boolean

(null) @constant.builtin

(string) @string

[
  (path_key_value)
  (file_key_value)
] @string.special

(numeric_constant) @number

(language_constant) @constant.builtin

(runtime_parameter) @constant.builtin

(integer) @number

(hex_integer) @number

(character_escape) @string.escape

; Functions
(instruction) @preproc

(builtin_function
  (function_name) @function)

(callable_commandlist
  [
    (callable_prefix) @function
    "\\" @punctuation.delimiter
    (namespace) @variant
    (section_identifier) @function
  ])

(callable_customshader
  [
    (callable_prefix) @function
    "\\" @punctuation.delimiter
    (namespace) @variant
    (section_identifier) @function
  ])

(property_access_expression
  (resource_property) @function
  arguments: (_))

(assignment_statement
  (resource_property) @function
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

(doc_comment) @comment.doc

(ERROR) @error
