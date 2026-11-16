; Keywords
(global_declaration
  [
    "global"
    "persist"
    "locked"
  ] @keyword.storage.type)

(global_initialisation
  [
    "global"
    "persist"
    "locked"
  ] @keyword.storage.type)

(local_declaration
  "local" @keyword.storage.type)

(local_initialisation
  "local" @keyword.storage.type)

(execution_modifier) @keyword.control

(proxy_modifier) @keyword.control

(resource_usage_expression
  (resource_modifier) @keyword.control)

[
  "if"
  "elif"
  "else if"
  "else"
  "endif"
] @keyword.control.conditional

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
    (namespace_key) @variable.other.member
    (namespace) @namespace
  ])

(conditional_include_statement
  (condition_key) @variable.other.member)

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
  key: (_) @variable.other.member)

; Key Expression Values
(field_expression
  (match_expression_field) @variable.other.member)

; Variables
(custom_resource
  [
    (resource_prefix) @label
    "\\" @punctuation.delimiter
    (namespace) @namespace
    (section_identifier) @attribute
  ])

(resource_pool
  [
    (resource_prefix) @label
    "\\" @punctuation.delimiter
    (namespace) @namespace
    (section_identifier) @attribute
  ])

(preset_section_identifier
  [
    (preset_prefix)? @label
    "\\" @punctuation.delimiter
    (namespace) @namespace
    (section_identifier) @variable
  ])

(named_variable
  [
    "$" @variable
    (namespace) @namespace
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
  (resource_property) @variable.other.member
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
(_
  fixed_value: (_) @type.enum.variant)

(setting_statement_value
  (fixed_value) @type.enum.variant)

(key_setting_statement
  (fixed_key_key_value) @type.enum.variant)

(key_binding_modifier) @keyword.control

(resource_type) @type.builtin

(resource_format) @type.enum.variant

(shader_semantic) @type.enum.variant

(blend_factor) @keyword

[
  (frame_analysis_option)
  (marking_actions_option)
] @type.enum.variant

(boolean_value) @constant.builtin.boolean

(null) @constant.builtin

(string) @string

[
  (path_key_value)
  (file_key_value)
] @string.special.path

(numeric_constant) @constant.numeric

(language_constant) @constant.builtin

(runtime_parameter) @constant.builtin

(integer) @constant.numeric.integer

(hex_integer) @constant.numeric.integer

(character_escape) @constant.character.escape

; Functions
(instruction) @function.macro ; just for fun

(builtin_function
  (function_name) @function.builtin)

(callable_commandlist
  [
    (callable_prefix) @function.call
    "\\" @punctuation.delimiter
    (namespace) @namespace
    (section_identifier) @function.call
  ])

(callable_customshader
  [
    (callable_prefix) @function.call
    "\\" @punctuation.delimiter
    (namespace) @namespace
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
(comment) @comment.line

(doc_comment) @comment.line.documentation

(ERROR) @error
