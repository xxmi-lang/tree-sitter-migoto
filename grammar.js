/**
 * @file tree-sitter grammar for the DSL of the INI files used by 3Dmigoto
 * @author LupoMikti <lupo@kaltsje.me>
 * @author AGMG
 * @license MIT
 */

/// <reference types='tree-sitter-cli/dsl' />
// @ts-check

const PREC = {
  OR: 1, // ||
  AND: 2, // &&
  BIT_OR: 3, // |
  BIT_XOR: 4, // ^
  BIT_AND: 5, // &
  EQUALITY: 6, // == === != !==
  COMPARE: 7, // < > <= >=
  RELATION: 8, // @not-implemented ~ (e.g. `in` or `instanceof` in javascript)
  BIT_SHIFT: 9, // >> <<
  CONCAT: 10, // @not-implemented ..
  PLUS: 11, // + -
  MULTI: 12, // * / // %
  POWER: 13, // **
  UNARY: 14, // ! + - ~
  SUFFIX: 15, // -> [] ()
};

const custom_section_name = /[^=$,\[\]\r\n]+/i;

const namespace_regex = /[^\s>\\|\/<?:*="$][^>\\|\/<?:*=$\r\n]+(?:[\\\/][^>\\|\/<?:*=$\r\n]+)*/i;

const path_regex = /(?:(?:(?:[a-z]:|\.[\.]?)?[\\\/])?(?:\.\.|[^\s>\\|\/<?:*"$][^>\\|\/<?:*"$\r\n]*)(?:[\\\/](?:\.\.|[^\s>\\|\/<?:*"$][^>\\|\/<?:*"$\r\n]*))+)/i;
// numbers can be in file extensions only if there is at least one non-number present in it too
const file_regex = /[^\s>\\|\/<?:*"$\r\n][^>\\|\/<?:*"$\r\n]*\.[a-z0-9_\-]*[a-z_\-][a-z0-9_\-]*/i;

const custom_shader_keys_with_brackets = new RustRegex(`(?xi)(?:blend_factor\\[[0-3]\\]|(?:blend|alpha|mask)\\[[0-7]\\])`);

const setting_section_directory_value_keys = new RustRegex(`(?xi)(?:
  (?:override|cache|storage)_directory|include(?:_recursive)? |
  exclude_recursive
)`);

const setting_section_key_binding_keys = new RustRegex(`(?xi)(?:
  (?:done_|toggle_)hunting | next_marking_mode | mark_snapshot |
  (?:previous|next|mark)_(?:pixel|vertex|compute|geometry|domain|hull)shader |
  (?:previous|next|mark)_(?:index|vertex)buffer | (?:previous|next)_(?:index|vertex)buffer_slot |
  (?:previous|next|mark)_rendertarget |
  take_screenshot | reload_fixes | (?:reload|wipe_user)_config | show_original |
  monitor_performance | freeze_performance_monitor | tune[123]_(?:up|down) |
  analyse_frame | toggle_full_screen | force_full_screen_on_key | toggle_input
)`);

const resource_type_values = new RustRegex(`(?xi)(?:
  (?:RW)?(?:Append|Consume)?StructuredBuffer|(?:RW)?(?:ByteAddress)?Buffer|(?:RW)?Texture[123]D|TextureCube
)`);

const dxgi_types_regex = new RustRegex(`(?xi)(?:DXGI_FORMAT_)?(?:
  UNKNOWN|R32G32B32A32_TYPELESS|R32G32B32A32_FLOAT|R32G32B32A32_UINT|R32G32B32A32_SINT|R32G32B32_TYPELESS|R32G32B32_FLOAT|R32G32B32_UINT|R32G32B32_SINT|
  R16G16B16A16_TYPELESS|R16G16B16A16_FLOAT|R16G16B16A16_UNORM|R16G16B16A16_UINT|R16G16B16A16_SNORM|R16G16B16A16_SINT|
  R32G32_TYPELESS|R32G32_FLOAT|R32G32_UINT|R32G32_SINT|R32G8X24_TYPELESS|D32_FLOAT_S8X24_UINT|R32_FLOAT_X8X24_TYPELESS|X32_TYPELESS_G8X24_UINT|
  R10G10B10A2_TYPELESS|R10G10B10A2_UNORM|R10G10B10A2_UINT|R11G11B10_FLOAT|R8G8B8A8_TYPELESS|R8G8B8A8_UNORM|R8G8B8A8_UNORM_SRGB|
  R8G8B8A8_UINT|R8G8B8A8_SNORM|R8G8B8A8_SINT|R16G16_TYPELESS|R16G16_FLOAT|R16G16_UNORM|R16G16_UINT|R16G16_SNORM|R16G16_SINT|R32_TYPELESS|D32_FLOAT|R32_FLOAT|
  R32_UINT|R32_SINT|R24G8_TYPELESS|D24_UNORM_S8_UINT|R24_UNORM_X8_TYPELESS|X24_TYPELESS_G8_UINT|R8G8_TYPELESS|R8G8_UNORM|R8G8_UINT|R8G8_SNORM|R8G8_SINT|
  R16_TYPELESS|R16_FLOAT|D16_UNORM|R16_UNORM|R16_UINT|R16_SNORM|R16_SINT|R8_TYPELESS|R8_UNORM|R8_UINT|R8_SNORM|R8_SINT|A8_UNORM|R1_UNORM|R9G9B9E5_SHAREDEXP|
  R8G8_B8G8_UNORM|G8R8_G8B8_UNORM|BC1_TYPELESS|BC1_UNORM|BC1_UNORM_SRGB|BC2_TYPELESS|BC2_UNORM|BC2_UNORM_SRGB|BC3_TYPELESS|BC3_UNORM|BC3_UNORM_SRGB|
  BC4_TYPELESS|BC4_UNORM|BC4_SNORM|BC5_TYPELESS|BC5_UNORM|BC5_SNORM|B5G6R5_UNORM|B5G5R5A1_UNORM|B8G8R8A8_UNORM|B8G8R8X8_UNORM|R10G10B10_XR_BIAS_A2_UNORM|
  B8G8R8A8_TYPELESS|B8G8R8A8_UNORM_SRGB|B8G8R8X8_TYPELESS|B8G8R8X8_UNORM_SRGB|BC6H_TYPELESS|BC6H_UF16|BC6H_SF16|BC7_TYPELESS|BC7_UNORM|BC7_UNORM_SRGB|
  AYUV|Y410|Y416|NV12|P010|P016|420_OPAQUE|YUY2|Y210|Y216|NV11|AI44|IA44|P8|A8P8|B4G4R4A4_UNORM
)`);

const hlsl_semantic_regex_d3d9up = new RustRegex(`(?xi)(?:
  (BINORMAL|BLENDINDICES|BLENDWEIGHT|COLOR|NORMAL|POSITION|TANGENT|TEXCOORD|TESSFACTOR|DEPTH)\\d+|
  POSITIONT|FOG|PSIZE\\d*|VFACE|VPOS
)`);

const hlsl_semantic_regex_d3d10up = new RustRegex(`(?xi)(?:
  SV_(?:ClipDistance|CullDistance|Target)\d+|
  SV_(?:(?:Inner)?Coverage|Depth(?:(?:Less|Greater)Equal)?|DispatchThreadID|DomainLocation|GroupID|GroupIndex|
  GroupThreadID|GSInstanceID|(?:Inside)?TessFactor|InstanceID|IsFrontFace|OutputControlPointID|Position|PrimitiveID|
  RenderTargetArrayIndex|SampleIndex|StencilRef|VertexID|ViewportArrayIndex|ShadingRate)
)`);

/**
 * Adapted from tree-sitter-lua, this returns a sequence of rules separated by a given delimiter
 *
 * @param {RuleOrLiteral} rule
 * @param {string} separator
 * @param {boolean} trailing_separator
 * @returns {SeqRule}
 */
const list_seq = (rule, separator, trailing_separator = false) =>
  trailing_separator ?
    seq(rule, repeat(seq(separator, rule)), optional(separator)) :
    seq(rule, repeat(seq(separator, rule)));

/**
 * Adapted from tree-sitter-lua, this function returns the rule for defining a binary expression
 *
 * @param {RuleOrLiteral} rule
 * @returns {ChoiceRule}
 */
const _generate_binary_expr_rule = (rule) => choice(
  ...[
    ['||', PREC.OR],
    ['&&', PREC.AND],
    ['<', PREC.COMPARE],
    ['<=', PREC.COMPARE],
    // ['~', PREC.RELATION],
    ['===', PREC.EQUALITY],
    ['==', PREC.EQUALITY],
    ['!==', PREC.EQUALITY],
    ['!=', PREC.EQUALITY],
    ['>=', PREC.COMPARE],
    ['>', PREC.COMPARE],
    ['|', PREC.BIT_OR],
    ['^', PREC.BIT_XOR],
    ['&', PREC.BIT_AND],
    ['>>', PREC.BIT_SHIFT],
    ['<<', PREC.BIT_SHIFT],
    ['+', PREC.PLUS],
    ['-', PREC.PLUS],
    ['*', PREC.MULTI],
    ['/', PREC.MULTI],
    ['//', PREC.MULTI],
    ['%', PREC.MULTI],
  ].map(([operator, precedence]) =>
    prec.left(
      precedence,
      seq(
        field('left', rule),
        // @ts-ignore:
        field('operator', operator),
        field('right', rule),
      ),
    ),
  ),
  ...[
    ['**', PREC.POWER],
  ].map(([operator, precedence]) =>
    prec.right(
      precedence,
      seq(
        field('left', rule),
        // @ts-ignore:
        field('operator', operator),
        field('right', rule),
      ),
    ),
  ),
);

export default grammar({
  name: 'migoto',

  extras: $ => [
    /[\s\f\uFEFF\u2060\u200B]|\r?\n/,
    $.comment,
    $.doc_comment,
    $._significant_ws,
  ],

  word: $ => $.fixed_value,

  inline: $ => [
    $._key_section_key,
    $._preset_section_key,
    $._setting_statement_key,
  ],

  externals: $ => [
    $._external_line,
    $._section_header_start,
    $._section_header_guard,
    $._pooled_variable_start,
    $._pooled_variable_guard,
    $._key_header_prefix,
    $._regex_header_prefix,
    $._preset_header_prefix,
    $._include_header_prefix,
    $._commandlist_header_prefix,
    $._commandlist_callable_prefix,
    $._customshader_callable_prefix,
    $._customresource_header_prefix,
    $._resourcepool_header_prefix,
    $._namespace_resolution_start,
    $._namespace_resolution_content,
    $._namespace_resolution_end,
    $._suffixed_key_header,
    $._suffixed_preset_header,
    $._suffixed_resource_header, // also used for Pools
    $._suffixed_include_header,
    $._suffixed_commandlist_header,
    $._regex_commandlist_header,
    $._regex_declarations_header,
    $._regex_pattern_header,
    $._regex_replace_header,
    $._newline,
    $._antiwhitespace,
    $.doc_comment_content,
    $._custom_resource_identifier,
    $.error_sentinel,
  ],

  supertypes: $ => [
    $.section,
    $.primary_statement,
    $.instruction_statement,
    $.list_expression,
    $.operational_expression,
    $.static_operational_expression,
    $.identifier,
  ],

  conflicts: $ => [
    // could probably be eliminated by making [Hunting] a specially handled section
    [$._frame_analysis_option_list, $.analysis_instruction],
  ],

  rules: {
    document: $ => seq(
      optional($.preamble),
      repeat($.section),
    ),

    preamble: $ => choice(
      $.namespace_declaration,
      $.conditional_include_statement,
      seq($.namespace_declaration, $.conditional_include_statement),
      seq($.conditional_include_statement, $.namespace_declaration),
    ),

    namespace_declaration: $ => seq(
      alias(/namespace/i, $.namespace_key),
      '=',
      optional(alias(namespace_regex, $.namespace)),
      $._newline,
    ),

    conditional_include_statement: $ => seq(
      alias(/condition/i, $.condition_key),
      '=',
      $.static_operational_expression,
      $._newline,
    ),

    section: $ => choice(
      $._special_section,
      $.setting_section,
      $.commandlist_section,
    ),

    _special_section: $ => choice(
      $.constants_section,
      $.key_section,
      $.preset_section,
      $._shader_regex_section,
    ),

    constants_section_header: $ => seq(
      '[',
      alias(/Constants/i, $.header_identifier),
      optional(']'),
      $._newline,
    ),

    constants_section_body: $ => repeat1(choice(
      $.global_declaration,
      $.global_initialisation,
      $.primary_statement,
    )),

    constants_section: $ => seq(
      field('header', $.constants_section_header),
      optional(field('body', $.constants_section_body)),
    ),

    key_section_header: $ => seq(
      '[',
      alias($._key_header_prefix, $.header_prefix),
      alias($._suffixed_key_header, $.header_identifier),
      optional(']'),
      $._newline,
    ),

    key_section_body: $ => repeat1(choice(
      $.key_setting_statement,
      $.key_run_instruction,
      $.key_condition_statement,
      $.key_assignment_statement,
    )),

    key_section: $ => seq(
      field('header', $.key_section_header),
      optional(field('body', $.key_section_body)),
    ),

    key_setting_statement: $ => choice(
      seq(
        field('key', $._key_section_key),
        '=',
        field('value', $.key_section_value),
        $._newline,
      ),
      seq(
        field('key', alias($._key_section_listable_key, $.key_section_key)),
        '=',
        field('value', choice(list_seq($.numeric_constant, ','), list_seq(alias($.fixed_value, $.fixed_key_key_value), ','))),
        $._newline,
      ),
      seq(
        field('key', alias($._key_section_key_binding_key, $.key_section_key)),
        '=',
        field('value', $._specific_key_binding_value),
        $._newline,
      ),
    ),

    _key_section_key: $ => alias($.fixed_value, $.key_section_key),

    _key_section_key_binding_key: _ => token(/key|back/i),

    _key_section_listable_key: _ => token(/separation|convergence|(release_)?transition(_type)?/i),

    key_section_value: $ => choice(
      field('fixed_value', alias($.fixed_value, $.fixed_key_key_value)),
      $.boolean_value,
      $._static_value,
    ),

    key_run_instruction: $ => seq(
      alias(/run/i, $.instruction),
      '=',
      list_seq($.callable_commandlist, ','),
      $._newline,
    ),

    key_condition_statement: $ => seq(
      field('key', alias(/condition/i, $.condition_key)),
      '=',
      list_seq($._operational_expression, ','),
      $._newline,
    ),

    key_assignment_statement: $ => seq(
      field('name', choice(
        $.ini_parameter,
        $.named_variable,
      )),
      '=',
      field('expression', $.static_list_expression),
      $._newline,
    ),

    preset_section_header: $ => seq(
      '[',
      alias($._preset_header_prefix, $.header_prefix),
      alias($._suffixed_preset_header, $.header_identifier),
      optional(']'),
      $._newline,
    ),

    preset_section_body: $ => repeat1(choice(
      $.preset_setting_statement,
      $.preset_run_instruction,
      $.preset_condition_statement,
      $.preset_assignment_statement,
    )),

    preset_section: $ => seq(
      field('header', $.preset_section_header),
      optional(field('body', $.preset_section_body)),
    ),

    preset_setting_statement: $ => seq(
      field('key', $._preset_section_key),
      '=',
      field('value', $.preset_section_value),
      $._newline,
    ),

    _preset_section_key: $ => alias($.fixed_value, $.preset_section_key),

    preset_section_value: $ => choice(
      field('fixed_value', alias($.fixed_value, $.fixed_preset_key_value)),
      $.boolean_value,
      $._static_value,
    ),

    preset_run_instruction: $ => seq(
      alias(/run/i, $.instruction),
      '=',
      $.callable_commandlist,
      $._newline,
    ),

    preset_condition_statement: $ => seq(
      alias(/condition/i, $.condition_key),
      '=',
      $._operational_expression,
      $._newline,
    ),

    preset_assignment_statement: $ => seq(
      field('name', choice(
        $.ini_parameter,
        $.named_variable,
      )),
      '=',
      field('expression', $._static_value),
      $._newline,
    ),

    _shader_regex_section: $ => choice(
      $.shader_regex_replace_section,
      $.shader_regex_pattern_section,
      $.shader_regex_declarations_section,
      $.shader_regex_commandlist_section,
    ),

    shader_regex_pattern_header: $ => seq(
      '[',
      seq(
        alias($._regex_header_prefix, $.header_prefix),
        alias($._regex_pattern_header, $.header_identifier),
      ),
      optional(']'),
    ),

    shader_regex_pattern_body: $ => repeat1(
      alias($._external_line, $.regex_pattern),
    ),

    shader_regex_pattern_section: $ => seq(
      field('header', $.shader_regex_pattern_header),
      $._newline,
      optional(field('body', $.shader_regex_pattern_body)),
    ),

    shader_regex_replace_header: $ => seq(
      '[',
      seq(
        alias($._regex_header_prefix, $.header_prefix),
        alias($._regex_replace_header, $.header_identifier),
      ),
      optional(']'),
    ),

    shader_regex_replace_body: $ => repeat1(seq(
      // searches the same as $._section_header_start
      // but returns true if it does NOT find a section header
      $._section_header_guard,
      alias(
        repeat1(
          choice(
            $.regex_replacement,
            $.regex_replacement_conditional,
            $.character_escape,
            $.free_text,
          ),
        ),
        $.regex_replace_line,
      ),
      $._newline,
      optional($._section_header_start),
    )),

    shader_regex_replace_section: $ => seq(
      field('header', $.shader_regex_replace_header),
      $._newline,
      optional(field('body', $.shader_regex_replace_body)),
    ),

    shader_regex_declarations_header: $ => seq(
      '[',
      seq(
        alias($._regex_header_prefix, $.header_prefix),
        alias($._regex_declarations_header, $.header_identifier),
      ),
      optional(']'),
    ),

    shader_regex_declarations_body: $ => repeat1(
      alias($._external_line, $.dxbc_declaration),
    ),

    shader_regex_declarations_section: $ => seq(
      field('header', $.shader_regex_declarations_header),
      $._newline,
      optional(field('body', $.shader_regex_declarations_body)),
    ),

    shader_regex_commandlist_header: $ => seq(
      '[',
      seq(
        alias($._regex_header_prefix, $.header_prefix),
        alias($._regex_commandlist_header, $.header_identifier),
      ),
      optional(']'),
    ),

    shader_regex_commandlist_body: $ => repeat1(choice(
      $.shader_regex_setting_statement,
      $.primary_statement,
    )),

    shader_regex_commandlist_section: $ => seq(
      field('header', $.shader_regex_commandlist_header),
      $._newline,
      optional(field('body', $.shader_regex_commandlist_body)),
    ),

    shader_regex_setting_statement: $ => seq(
      choice(
        seq(
          field('key', alias(/(shader_model|temps)/i, $.shader_regex_key)),
          '=',
          field('value', repeat1($.free_text)),
        ),
        seq(
          field('key', alias(/filter_index/i, $.shader_regex_key)),
          '=',
          field('value', $.numeric_constant),
        ),
      ),
      $._newline,
    ),

    setting_section_header: $ => seq(
      '[',
      choice(
        alias(
          /(Logging|System|Device|Stereo|Rendering|Hunting|Profile|ConvergenceMap|Loader|Input)/i,
          $.header_identifier,
        ),
        choice(
          seq(
            alias(choice($._customresource_header_prefix, $._resourcepool_header_prefix), $.header_prefix),
            alias($._suffixed_resource_header, $.header_identifier),
          ),
          seq(
            alias($._include_header_prefix, $.header_prefix),
            alias($._suffixed_include_header, $.header_identifier),
          ),
        ),
      ),
      optional(']'),
      $._newline,
    ),

    setting_section_body: $ => repeat1($.setting_statement),

    setting_section: $ => seq(
      field('header', $.setting_section_header),
      optional(field('body', $.setting_section_body)),
    ),

    setting_statement: $ => choice(
      // general setting keys that don't need special handling
      seq(
        field('key', choice($._setting_statement_key, $._bracketed_setting_statement_key)),
        '=',
        field('value', $.setting_statement_value),
        $._newline,
      ),
      // the hash key needs to take free_text, which would normally conflict with fixed_value here
      seq(
        field('key', alias(/hash/i, $.setting_statement_key)),
        '=',
        field('value', alias($._hash_value, $.setting_statement_value)),
        $._newline,
      ),
      // the shader name keys used in custom shader sections which can be a path or null
      seq(
        field('key', alias(/[vhdgpc]s/i, $.setting_statement_key)),
        '=',
        field('value', alias($._specific_custom_shader_value, $.setting_statement_value)),
        $._newline,
      ),
      // any keys that take KeyBindings, which can also be a single free_text node or single exception_character node
      seq(
        field('key', alias(setting_section_key_binding_keys, $.setting_statement_key)),
        '=',
        field('value', alias($._specific_key_binding_value, $.setting_statement_value)),
        $._newline,
      ),
      // remaining keys that can take paths/files so a value that would have a conflict btwn fixed_value and free_text is always treated as a path
      seq(
        field('key', $._directory_setting_statement_key),
        '=',
        field('value', alias($._specific_directory_value, $.setting_statement_value)),
        $._newline,
      ),
      // the analyse_options key has a value that conflicts with the value of the marking_actions key
      // so unfortunately, because there is no backtracking and `mono_snapshot` is longer than `mono`
      // we need to do special handling for this key
      seq(
        field('key', alias(/analyse_options/i, $.setting_statement_key)),
        '=',
        field('value', alias($._frame_analysis_option_list, $.setting_statement_value)),
        $._newline,
      ),
    ),

    // $._hash_vale and $._frame_analysis_option_list
    // These exist only to keep the two special cases in line with how $.setting_statement_value is parsed for non-special situations
    // Basically, I need (setting_statement_value (_)) and not just (setting_statement_value)
    _hash_value: $ => $.free_text,

    _frame_analysis_option_list: $ => $.frame_analysis_option_list,

    _specific_custom_shader_value: $ => choice($.null, $._path_value),

    _specific_key_binding_value: $ => choice($.free_text, $.exception_character, $.key_binding_modifier, $.key_binding_expression),

    _specific_directory_value: $ => choice(alias($.free_text, $.path_key_value), $._path_value),

    _directory_setting_statement_key: $ =>
      // path/file only keys:
      alias(token(prec(-1, setting_section_directory_value_keys)), $.setting_statement_key),

    _bracketed_setting_statement_key: $ => alias(custom_shader_keys_with_brackets, $.setting_statement_key),

    _setting_statement_key: $ => alias($.fixed_value, $.setting_statement_key),

    setting_statement_value: $ => choice(
      $.resource_format,
      alias(resource_type_values, $.resource_type),
      $.boolean_value,
      $.string,
      $._path_value,
      $.static_operational_expression,
      $.fuzzy_match_expression,
      $._list_expression,
      field('fixed_value', alias($.fixed_value, $.fixed_setting_key_value)),
    ),

    commandlist_section_header: $ => seq(
      '[',
      choice(
        alias(/(Present|Clear(?:RenderTarget|DepthStencil)View|ClearUnorderedAccessView(?:Uint|Float))/i, $.header_identifier),
        seq(
          alias($._commandlist_header_prefix, $.header_prefix),
          alias($._suffixed_commandlist_header, $.header_identifier),
        ),
      ),
      optional(']'),
      $._newline,
    ),

    commandlist_section: $ => seq(
      field('header', $.commandlist_section_header),
      optional(field('body', alias($._block, $.commandlist_section_body))),
    ),

    primary_statement: $ => choice(
      $.local_declaration,
      $.local_initialisation,
      $.assignment_statement,
      $.instruction_statement,
      $.conditional_statement,
    ),

    local_declaration: $ => seq(
      alias($._local, 'local'),
      field('variable', $.named_variable),
      $._newline,
    ),

    local_initialisation: $ => seq(
      alias($._local, 'local'),
      field('variable', $.named_variable),
      '=',
      field('expression', $._operational_expression),
      $._newline,
    ),

    global_declaration: $ => choice(
      $._global_transient_declaration,
      $._global_persist_declaration,
      $._global_locked_declaration,
    ),

    global_initialisation: $ => choice(
      $._global_transient_initialisation,
      $._global_persist_initialisation,
      $._global_locked_initialisation,
    ),

    _global_transient_declaration: $ => seq(
      alias($._global, 'global'),
      field('variable', $.named_variable),
      $._newline,
    ),

    _global_persist_declaration: $ => seq(
      choice(
        seq(alias($._global, 'global'), alias($._persist, 'persist')),
        seq(alias($._persist, 'persist'), alias($._global, 'global')),
      ),
      field('variable', $.named_variable),
      $._newline,
    ),

    _global_locked_declaration: $ => seq(
      choice(
        seq(alias($._global, 'global'), alias($._locked, 'locked')),
        seq(alias($._locked, 'locked'), alias($._global, 'global')),
      ),
      field('variable', $.named_variable),
      $._newline,
    ),

    _global_transient_initialisation: $ => seq(
      alias($._global, 'global'),
      $._static_initialisation,
      $._newline,
    ),

    _global_persist_initialisation: $ => seq(
      choice(
        seq(alias($._global, 'global'), alias($._persist, 'persist')),
        seq(alias($._persist, 'persist'), alias($._global, 'global')),
      ),
      $._static_initialisation,
      $._newline,
    ),

    _global_locked_initialisation: $ => seq(
      choice(
        seq(alias($._global, 'global'), alias($._locked, 'locked')),
        seq(alias($._locked, 'locked'), alias($._global, 'global')),
      ),
      $._static_initialisation,
      $._newline,
    ),

    _static_initialisation: $ => seq(
      field('variable', $.named_variable),
      '=',
      field('value', $.static_operational_expression),
    ),

    assignment_statement: $ => seq(
      optional($.execution_modifier),
      choice(
        seq(
          field('name', choice(
            $.ini_parameter,
            $._scalar_variable,
          )),
          '=',
          field('expression', $._operational_expression),
          $._newline,
        ),
        seq(
          field('name', choice($._limited_resource_operand, $._bare_resource_pool)),
          '=',
          field('expression', $.resource_usage_expression),
          $._newline,
        ),
        seq(
          prec.left(PREC.SUFFIX, seq(
            $._limited_resource_operand,
            field('operator', '->'),
            alias($.fixed_value, $.resource_property),
            field('arguments', $.arguments),
          )),
          '=',
          field('value', choice($.resource_format, $.integer)),
          $._newline,
        ),
        seq(
          field('name', $.callable_commandlist),
          '=',
          field('source', choice(
            $.null,
            seq(optional(alias(/ref(?:erence)?/i, $.proxy_modifier)), $.callable_commandlist),
          )),
        ),
      ),
    ),

    // adapted from tree-sitter-lua
    _block: ($) => repeat1(choice(
      $.setting_statement,
      $.primary_statement,
    )),

    // adapted from tree-sitter-lua
    conditional_statement: $ => seq(
      $.if_statement,
      repeat(field('alternative', $.elseif_statement)),
      optional(field('alternative', $.else_statement)),
      alias($._endif, 'endif'),
      $._newline,
    ),

    if_statement: $ => seq(
      alias($._if, 'if'),
      $._significant_ws,
      field('condition', $._operational_expression),
      $._newline,
      field('consequence', alias(optional($._block), $.block)),
    ),

    // adapted from tree-sitter-lua
    elseif_statement: $ => seq(
      choice(alias($._elif, 'elif'), alias($._elseif, 'else if')),
      $._significant_ws,
      field('condition', $._operational_expression),
      $._newline,
      field('consequence', alias(optional($._block), $.block)),
    ),

    // adapted from tree-sitter-lua
    else_statement: $ => seq(
      alias($._else, 'else'),
      field('body', alias(optional($._block), $.block)),
    ),

    instruction_statement: $ => choice(
      $.run_instruction,
      $.check_texture_override_instruction,
      $.preset_instruction,
      $.handling_instruction,
      $.reset_instruction,
      $.clear_instruction,
      $.stereo_instruction,
      $.dme_instruction,
      $.analysis_instruction,
      $.dump_instruction,
      $.special_instruction,
      $.store_instruction,
      // draw instructions
      $.draw_instruction,
      $.drawindexed_instruction,
      $.drawinstanced_dispatch_instruction,
      $.drawindirect_instruction,
      $.drawauto_instruction,
    ),

    execution_modifier: $ => choice(
      alias($._pre, 'pre'),
      alias($._post, 'post'),
    ),

    run_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/run/i, $.instruction),
      '=',
      $._callable_section,
      $._newline,
    ),

    check_texture_override_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/checktextureoverride/i, $.instruction),
      '=',
      $._resource_operand,
      $._newline,
    ),

    preset_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/(?:exclude_)?preset/i, $.instruction),
      '=',
      choice(
        alias($._useable_section_identifier, $.preset_section_identifier),
        $.preset_section_identifier,
      ),
      $._newline,
    ),

    handling_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/handling/i, $.instruction),
      '=',
      field('fixed_value', alias($.fixed_value, $.handling_key_value)),
      $._newline,
    ),

    reset_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/reset_per_frame_limits/i, $.instruction),
      '=',
      repeat1(choice(
        $._resource_operand,
        $.callable_customshader,
      )),
      $._newline,
    ),

    clear_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/clear/i, $.instruction),
      '=',
      repeat1(choice(
        $._resource_operand,
        alias(/0x[a-f0-9]+/i, $.hex_integer),
        $._static_value,
        field('fixed_value', alias($.fixed_value, $.clear_instruction_key_value)),
      )),
      $._newline,
    ),

    stereo_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/(?:separation|convergence)/i, $.instruction),
      '=',
      $._static_value,
      $._newline,
    ),

    dme_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/direct_mode_eye/i, $.instruction),
      '=',
      field('fixed_value', alias($.fixed_value, $.dme_instruction_key_value)),
      $._newline,
    ),

    analysis_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/analyse_options/i, $.instruction),
      '=',
      $.frame_analysis_option_list,
      $._newline,
    ),

    dump_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/dump/i, $.instruction),
      '=',
      choice($._resource_operand, $.dump_instruction_value_list),
      $._newline,
    ),

    special_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/special/i, $.instruction),
      '=',
      field('fixed_value', alias($.fixed_value, $.special_instruction_key_value)),
      $._newline,
    ),

    store_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/store/i, $.instruction),
      '=',
      $._scalar_variable,
      ',',
      $._limited_resource_operand,
      ',',
      $._operational_expression,
      $._newline,
    ),

    draw_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/draw/i, $.instruction),
      '=',
      choice(
        field('fixed_value', alias($.fixed_value, $.draw_instruction_key_value)),
        list_seq($._operational_expression, ','),
      ),
      $._newline,
    ),

    drawindexed_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/drawindexed(?:instanced)?/i, $.instruction),
      '=',
      choice(
        field('fixed_value', alias($.fixed_value, $.draw_instruction_key_value)),
        list_seq($._operational_expression, ','),
      ),
      $._newline,
    ),

    drawinstanced_dispatch_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/(?:drawinstanced|dispatch)/i, $.instruction),
      '=',
      list_seq($._operational_expression, ','),
      $._newline,
    ),

    drawindirect_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/(?:drawinstanced|drawindexedinstanced|dispatch)indirect/i, $.instruction),
      '=',
      alias(seq($._resource_operand, ',', $.integer), $.resource_offset_expression),
      $._newline,
    ),

    drawauto_instruction: $ => seq(
      optional($.execution_modifier),
      alias(/drawauto/i, $.instruction),
      $._newline,
    ),

    // EXPRESSIONS

    list_expression: $ => choice(
      $.resource_data_array_expression,
      $.blend_expression,
      $.frame_analysis_option_list,
      $.marking_actions_option_list,
    ),

    _list_expression: $ => choice(
      $.list_expression,
      $._fixed_value_list,
    ),

    // written to guarantee 2 or more desired nodes
    key_binding_expression: $ => seq(
      choice(
        $.key_binding_modifier,
        $.exception_character,
        $.free_text,
      ),
      repeat1(
        choice(
          $.key_binding_modifier,
          $.exception_character,
          $.free_text,
        ),
      ),
    ),

    exception_character: _ => token.immediate(prec(2, choice(';', '=', '/', '\\'))),

    key_binding_modifier: _ => /(?:(?:no_)?(?:vk_)?(?:ctrl|control|alt|shift|windows)|no_modifiers)/i,

    resource_data_array_expression: $ => choice(
      seq(
        optional($.resource_format),
        $.numeric_constant,
        repeat1($.numeric_constant),
      ),
      seq(
        $.resource_format,
        $.numeric_constant,
      ),
    ),

    resource_usage_expression: $ => seq(
      repeat($.resource_modifier),
      choice(
        $._resource_operand,
        $._bare_resource_pool,
        alias($._resource_property_method_call, $.property_access_expression),
      ),
      repeat($.resource_modifier),
    ),

    resource_modifier: _ =>
      /(copy(?:_desc(?:ription)?)?|ref(?:erence)?|raw|stereo|mono|stereo2mono|set_viewport|no_view_cache|resolve_msaa|unless_null)/i,

    _resource_operand: $ => choice(
      $._language_variable,
      $.resource_identifier,
      $.custom_resource,
      $.resource_pool,
    ),

    _limited_resource_operand: $ => choice(
      $._limited_language_variable,
      $.resource_identifier,
      $.custom_resource,
      $.resource_pool,
    ),

    builtin_function: $ => prec.left(PREC.SUFFIX, seq(
      alias($.fixed_value, $.function_name),
      // technically the builtin functions can only take one argument
      // but we ignore that here for simplicity
      field('arguments', $.arguments),
    )),

    property_access_expression: $ => prec.left(PREC.SUFFIX, seq(
      choice($._resource_operand, $._bare_resource_pool),
      field('operator', '->'),
      alias($.fixed_value, $.resource_property),
      // technically xxmi only allows a subset of operands as arguments
      // but we ignore that here for simplicity
      optional(field('arguments', $.arguments)),
    )),

    // differs from the above in that that arguments are required
    _resource_property_method_call: $ => prec.left(PREC.SUFFIX, seq(
      choice($._resource_operand, $._bare_resource_pool),
      field('operator', '->'),
      alias($.fixed_value, $.resource_property),
      // technically xxmi only allows a subset of operands as arguments
      // but we ignore that here for simplicity
      field('arguments', $.arguments),
    )),

    arguments: $ => seq(
      '(',
      list_seq(
        choice($._operational_expression, $.shader_semantic),
        ',',
        false,
      ),
      ')',
    ),

    fuzzy_match_expression: $ => seq(
      optional(field('operator', alias(/([><]=?|[!=])/, $.fuzzy_operator))),
      choice(
        $.integer,
        $.field_expression,
      ),
    ),

    field_expression: $ => seq(
      $.match_expression_field,
      choice(
        seq('*', $.match_expression_field),
        seq(
          optional(seq('*', $.integer)),
          optional(seq('/', $.integer)),
        ),
      ),
    ),

    match_expression_field: _ => field('field_name', /((?:res_)?(?:width|height)|depth|array)/i),

    blend_expression: $ => choice(
      field('operator', alias(/disable/i, $.blend_operator)),
      seq(
        field('operator', alias(/(add|(?:rev_)?subtract|min|max)/i, $.blend_operator)),
        $.blend_factor,
        $.blend_factor,
      ),
    ),

    blend_factor: _ => /(zero|one|(?:inv_)?(?:src1?|dest)_(?:color|alpha)|src_alpha_sat|(?:inv_)?blend_factor)/i,

    marking_actions_option_list: $ => repeat1($.marking_actions_option),

    frame_analysis_option_list: $ => repeat1($.frame_analysis_option),

    dump_instruction_value_list: $ => seq(
      $._resource_operand,
      repeat1($.frame_analysis_option),
    ),

    _fixed_value_list: $ => seq($.fixed_value, repeat1($.fixed_value)),

    static_operational_expression: $ => choice(
      $._static_value,
      $.static_parenthesized_expression,
      $.static_binary_expression,
      $.static_unary_expression,
    ),

    static_parenthesized_expression: $ => seq(
      '(',
      $.static_operational_expression,
      ')',
    ),

    static_binary_expression: $ => _generate_binary_expr_rule($.static_operational_expression),

    static_unary_expression: $ => prec.left(
      PREC.UNARY,
      seq(choice('-', '+', '!', '~'), field('operand', $.static_operational_expression)),
    ),

    static_list_expression: $ => list_seq($._static_value, ','),

    _operational_expression: $ => choice(
      $.operational_expression,
      $._special_operational_expresssion,
    ),

    _special_operational_expresssion: $ => choice(
      $._limited_resource_operand,
      $.property_access_expression,
    ),

    operational_expression: $ => choice(
      $._limited_static_value,
      $.identifier,
      $.builtin_function,
      $.parenthesized_expression,
      $.binary_expression,
      $.unary_expression,
    ),

    parenthesized_expression: $ => seq(
      '(',
      $._operational_expression,
      ')',
    ),

    binary_expression: $ => _generate_binary_expr_rule($._operational_expression),

    // adapted from tree-sitter-lua
    unary_expression: $ => prec.right(
      PREC.UNARY,
      choice(
        seq(field('operator', choice('-', '+', '!', '~')), field('operand', $._operational_expression)),
        seq(field('operator', '@'), field('operand', choice($._resource_operand, alias($._resource_pool_base, $.resource_pool)))),
        seq(field('operator', '#'), field('operand', choice($.resource_pool, alias($._resource_pool_base, $.resource_pool)))),
      ),
    ),

    identifier: $ => choice(
      $._scalar_variable,
      $.ini_parameter,
      $._resource_format,
      $.bind_flag,
      $.shader_identifier,
      $.scissor_rectangle,
      $.runtime_parameter,
    ),

    _scalar_variable: $ => choice(
      $.named_variable,
      $.pooled_variable,
    ),

    _language_variable: $ => choice(
      $._limited_language_variable,
      prec(1, $.shader_identifier),
    ),

    _limited_language_variable: $ => choice(
      alias(/(?:[vhdgpc]s-cb\d\d?|vb\d|ib|(?:[rf]_)?bb)/i, $.buffer_variable),
      alias(/(?:[pc]s-u\d|s?o\d|od|[vhdgpc]s(?:-t\d\d?\d?))/i, $.shader_variable),
    ),

    resource_identifier: $ => choice(
      token(/(?:this|(?:ini|stereo)params|cursor_(?:mask|color))/i),
      $.null,
    ),

    custom_resource: $ => seq(
      alias($._customresource_header_prefix, $.resource_prefix),
      $._useable_resource_identifier,
    ),

    resource_pool: $ => prec.left(PREC.SUFFIX, seq(
      $._resource_pool_base,
      alias($._index_suffix, $.index_expression),
    )),

    // XXMI: a pool without an index keeps its resource_pool node, as for `@Pool`/`#Pool`, so
    // a bare `PoolFoo` is still a reference (ResourceCopyTarget::ParseTargetPool)
    _bare_resource_pool: $ => alias($._resource_pool_base, $.resource_pool),

    _resource_pool_base: $ => seq(
      alias($._resourcepool_header_prefix, $.resource_prefix),
      $._useable_resource_identifier,
    ),

    _useable_resource_identifier: $ => seq(
      optional($._namespace_resolution),
      alias($._custom_resource_identifier, $.section_identifier),
    ),

    _index_suffix: $ => seq(
      '[',
      choice($.numeric_constant, $._scalar_variable, $.runtime_parameter, '*'),
      ']',
    ),

    named_variable: $ => seq(
      '$',
      $._antiwhitespace, // XXX: Consider getting rid of this and folding functionality into following external rule
      $._pooled_variable_guard,
      optional($._namespace_resolution),
      alias(/[a-z_]\w+|[a-z]/i, $.variable_identifier),
    ),

    pooled_variable: $ => seq(
      '$',
      $._antiwhitespace, // XXX: Consider getting rid of this and folding functionality into following external rule
      $._pooled_variable_start,
      $.resource_pool,
    ),

    // Oh the BS I have to do to deal with tree-sitter's regex restrictions
    ini_parameter: _ => choice(
      token(prec(-2, /[xyzw]/i)),
      /[xyzw]\d/i,
      /[xyzw]\d\d/i,
      /[xyzw]\d\d\d/i,
    ),

    shader_identifier: _ => /[vhdgpc]s/i,

    scissor_rectangle: _ => /(scissor\d+_(?:left|top|right|bottom))/i,

    runtime_parameter: _ => new RustRegex(`(?xi)(
      (?:rt|res|window)_(?:width|height) | (?:vertex|index|instance)_count | first_(?:vertex|index|instance) |
      thread_group_count_[xyz] | indirect_offset | draw_type | cursor_(?: showing | (?:screen_|window_|hotspot_)?[xy] ) |
      time | hunting | sli | frame_analysis | effective_dpi | (?:raw_|eye_)?separation | convergence |
      frame_time | fps | (?:frame|dispatch|draw)_number |
      stereo_(?:active|available) | scissor_(?:left|top|right|bottom)
    )`),

    static_runtime_parameter: _ => /(sli|time|frame_(?:time|number|analysis)|hunting|stereo_(?:active|available))/i,

    _callable_section: $ => choice(
      $.callable_commandlist,
      $.callable_customshader,
    ),

    callable_commandlist: $ => seq(
      alias($._commandlist_callable_prefix, $.callable_prefix),
      $._useable_section_identifier,
    ),

    callable_customshader: $ => seq(
      alias($._customshader_callable_prefix, $.callable_prefix),
      $._useable_section_identifier,
    ),

    preset_section_identifier: $ => seq(
      alias($._preset_header_prefix, $.preset_prefix),
      $._useable_section_identifier,
    ),

    _useable_section_identifier: $ => seq(
      optional($._namespace_resolution),
      alias(token.immediate(custom_section_name), $.section_identifier),
    ),

    _namespace_resolution: $ => seq(
      alias($._namespace_resolution_start, '\\'),
      alias($._namespace_resolution_content, $.namespace),
      alias($._namespace_resolution_end, '\\'),
    ),

    _static_value: $ => choice(
      alias($.static_runtime_parameter, $.runtime_parameter),
      alias(/[+-]?(inf|NaN)/i, $.language_constant),
      $.numeric_constant,
      $.named_variable,
    ),

    _limited_static_value: $ => choice(
      alias($.static_runtime_parameter, $.runtime_parameter),
      alias(/[+-]?(inf|NaN)/i, $.language_constant),
      $.numeric_constant,
    ),

    numeric_constant: _ => choice(
      token(/[+-]?\d+(\.\d+(e[-+]\d+)?)?/i),
      token(/[+-]?\.\d+/i), // apparently 3dmigoto allows floats of the form -.56 and the like
    ),

    integer: _ => token(/\d+/i),

    string: _ => seq(
      '"',
      // deno-lint-ignore no-control-regex
      token.immediate(repeat(/[^\x00-\x08\x0a-\x1f\x22\x7f]/)), // exclude: from null to backspace, from \n to unit separator, ", delete
      token.immediate('"'),
    ),

    boolean_value: _ => /(?:true|false|yes|no|on|off)/i,

    _path_value: $ => choice(
      alias(path_regex, $.path_key_value),
      alias(file_regex, $.file_key_value),
    ),

    frame_analysis_option: _ => new RustRegex(`(?xi)(
      hold|stereo|mono|
      dump_(?:rt|depth|tex|[cvi]b)|jp(?:s|e?g)|(?:jp(?:s|e?g)_)?dds|buf|txt|desc|clear_rt|persist|
      filename_(?:reg|handle)|log|dump_on_(?:unmap|update)|deferred_ctx_(?:immediate|accurate)|
      share_dupes|symlink|dump_(?:rt|depth|tex)_(?:jps|dds)|dump_[cvi]b_txt
    )`),

    marking_actions_option: _ => /(clipboard|hlsl|asm|regex|mono_snapshot|stereo_snapshot|snapshot_if_pink)/i,

    _regex_replacement_content: $ => choice(
      $.regex_replacement,
      $.regex_replacement_conditional,
      $.character_escape,
      alias($.free_text_no_colon, $.free_text),
    ),

    regex_replacement: $ => choice(
      seq('${', alias(/\w+/i, $.replacement_identifier), '}'), // ${identifier}
      seq('$<', alias(/\w+/i, $.replacement_identifier), '>'), // $<name>
      seq('$', token.immediate(/\d+|[&$`'_+]/)),
    ),

    regex_replacement_conditional: $ => prec.right(choice(
      // ${name:-string}
      seq('${', alias(/\w+/i, $.replacement_identifier), ':-', repeat1($._regex_replacement_content), '}'),
      // ${name:+string1:string2}
      seq(
        '${', alias(/\w+/i, $.replacement_identifier), ':+',
        repeat1($._regex_replacement_content),
        optional(seq(
          ':',
          repeat1($._regex_replacement_content),
        )),
        '}',
      ),
    )),

    resource_format: _ => dxgi_types_regex,

    // Exists to enforce required prefix when used as an operand
    _resource_format: _ => /DXGI_FORMAT_\w+/i,

    bind_flag: _ => /D3D11_BIND_\w+/i,

    shader_semantic: _ => choice(
      hlsl_semantic_regex_d3d9up,
      hlsl_semantic_regex_d3d10up,
    ),

    character_escape: _ => /\\[a-z\(\)\[\]${}:]/i,

    free_text: _ => /[^\\\/;="${}\s]+/i,

    free_text_no_colon: _ => /[^\\\/;:="${}\s]+/i,

    fixed_value: _ => token(prec(-1, /[a-z0-9][a-z0-9_]+/i)),

    // based on tree-sitter-zig github PR#10
    doc_comment: $ => prec(3, seq(
      field('start', ';;!'),
      field('content', $.doc_comment_content),
    )),

    comment: $ => prec(1, seq(
      field('start', ';'),
      field('content', /[^\r\n]*/),
      $._newline,
    )),

    null: _ => /null/i,

    // XXX: inline these?
    _global: _ => /global/i,

    _persist: _ => /persist/i,

    _locked: _ => /locked/i,

    _local: _ => /local/i,

    _if: _ => /if/i,

    _elif: _ => /elif/i,

    _elseif: _ => /else if/i,

    _else: _ => /else/i,

    _endif: _ => /endif/i,

    _pre: _ => /pre/i,

    _post: _ => /post/i,

    _significant_ws: _ => /[ \t]+/i,
  },
});
