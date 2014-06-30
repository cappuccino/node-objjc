/*
 * formats.js
 *
 * Created by Aparajita Fishman.
 * Copyright 2014, Aparajita Fishman.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the MIT license (http://opensource.org/licenses/MIT).
 */

"use strict";

var fs = require("fs"),
    path = require("path");

require("./utils");

// Map between AST node types and format node types
var typeMap = {
    "*": "*",  // global properties
    "Program": "program",
    "Statement": "statement",
    "EmptyStatement": "empty statement",
    "BlockStatement": "{}",
    "ExpressionStatement": "expression statement",
    "IfStatement": "if",
    "LabeledStatement": "label",
    "BreakStatement": "break",
    "ContinueStatement": "continue",
    "WithStatement": "with",
    "SwitchStatement": "switch",
    "ReturnStatement": "return",
    "ThrowStatement": "throw",
    "TryStatement": "try",
    "WhileStatement": "while",
    "DoWhileStatement": "do while",
    "ForStatement": "for",
    "ForInStatement": "for in",
    "ForInit": "for init",
    "DebuggerStatement": "debugger",
    "FunctionDeclaration": "function",
    "FunctionExpression": "function expression",
    "VariableDeclaration": "var",
    "ThisExpression": "this",
    "ArrayExpression": "array",
    "ObjectExpression": "object",
    "SequenceExpression": ",",
    "UnaryExpression": "unary expression",
    "UpdateExpression": "update expression",
    "BinaryExpression": "binary expression",
    "AssignmentExpression": "assignment",
    "TernaryExpression": "ternary expression",
    "NewExpression": "new",
    "CallExpression": "function call",
    "MemberExpression": "member",
    "Identifier": "identifier",
    "IdentifierName": "identifier name",
    "Literal": "literal",
    "ObjectiveJType": "objective-j type",
    "ArrayLiteral": "@[]",
    "DictionaryLiteral": "@{}",
    "ImportStatement": "@import",
    "ClassDeclarationStatement": "@implementation",
    "ProtocolDeclarationStatement": "@protocol",
    "IvarDeclaration": "ivar",
    "MethodDeclarationStatement": "method",
    "MessageSendExpression": "message",
    "SelectorLiteralExpression": "@selector",
    "ProtocolLiteralExpression": "@protocol()",
    "Reference": "@ref",
    "Dereference": "@deref",
    "ClassStatement": "@class",
    "GlobalStatement": "@global",
    "PreprocessorStatement": "#"
};

var availableFormats = function()
{
    // Be nice and show what formats *are* available
    var formatsPath = path.join(__dirname, "..", "formats");

    return fs.readdirSync(formatsPath)
        .filter(function(filename)
        {
            return filename.endsWith(".json");
        })
        .map(function(filename)
        {
            return path.basename(filename, path.extname(filename));
        });
};

/*
    Convert a raw JSON format into a Format object.
*/
var Format = function(/* Object */ format)
{
    // The format data, a hash of node names and format specs
    this.data = Object.create(null);

    // A map between meta node names (e.g. "*block")
    // and a hash of the node names they represent.
    this.metaMap = Object.create(null);

    // Global properties
    this.globals = Object.create(null);

    if (format)
        this.render(format);
};

/*
    To avoid extra lookups for meta nodes, we render the meta
    nodes into real nodes.
*/
Format.prototype.render = function(/* Object */ format)
{
    // Render meta nodes
    for (var key in format)
    {
        var currentNode = format[key];

        if (key === "*")
        {
            this.cloneNode(currentNode, "*");
            this.globals = this.data["*"];
            continue;
        }
        else if (!format.hasOwnProperty(key))
            continue;

        if (key.charAt(0) === "*" && key.length > 1)
        {
            var nodes = currentNode.nodes || [];

            // Remove nodes array so we can clone the rest of the properties
            delete currentNode.nodes;

            nodes.forEach(function(name) {
                this.cloneNode(currentNode, name);
                this.metaMap[name] = key;
            }, this);  // jshint ignore:line
        }
        else
        {
            this.cloneNode(currentNode, key);
        }
    }
};

/*
    If no data node with the given name exists, create it and copy node.
    Otherwise merge node with the existing data node.
*/
Format.prototype.cloneNode = function(/* Object */ node, /* String */ name)
{
    var target = this.data[name] || Object.create(null);

    for (var key in node)
    {
        if (node.hasOwnProperty(key))
        {
            target[key] = node[key];

            if (["before", "after"].indexOf(key) >= 0 && typeof target[key] === "string")
                target[key] = { "*": target[key] };
        }
    }

    this.data[name] = target;
};

Format.prototype.valueForProperty = function(/* Scope */ scope, /* String */ type, /* String */ key)
{
    // Map from acorn node types to our node types
    type = typeMap[type];

    if (type)
    {
        var node = this.data[type];

        if (node && key in node)
        {
            var value = node[key];

            /*
                If key is "before" or "after", the value might be a hash which tells
                us what value to return. For "before", we check the prior node.
                For "after", we check the parent node.
            */
            if (typeof value === "object")
            {
                var otherNode;

                if (key.startsWith("before"))
                    otherNode = scope.previousNode();
                else if (key.startsWith("after"))
                    otherNode = scope.parentNode();
                else
                    otherNode = null;

                if (otherNode)
                    value = this.lookupValue(otherNode.type, value);
                else
                    value = null;

                // console.log("%s/%s, %s/%s, %s", scope.nodes.last() ? scope.nodes.last().type : "null", key, (otherNode || {}).type, (scope.parentNode() || {}).type, value);
            }

            return value;
        }

        return this.globals[key];
    }

    return null;
};

/*
    Given a type name and a hash of possible type names, find the matching item:

    - Look for an exact match for type in hash.
    - If that fails, see if type is in a meta type. If so, look for that meta type in hash.
    - If that fails, look for "*" in hash.
*/
Format.prototype.lookupValue = function(/* String */ type, /* Object */ hash)
{
    var value = "";
    type = typeMap[type];

    if (type)
    {
        if (type in hash)
            value = hash[type];
        else
        {
            var metaType = this.metaMap[type];

            if (metaType && metaType in hash)
                value = hash[metaType];
            else if ("*" in hash)
                value = hash["*"];
        }
    }

    return value;
};

/*
    Load the format at the given path. If the path contains a directory
    separator, the file at the given path is loaded. Otherwise the named
    format is loaded from the formats directory. In either case, if the
    load is successful, the format specification object is returned.
    If there are errors, an Error is thrown.
*/
exports.load = function(formatPath)
{
    var filePath = formatPath,
        error = null;

    formatPath = null;

    if (filePath.indexOf(path.sep) >= 0)
    {
        // Load a user-supplied format
        filePath = path.resolve(filePath);

        if (fs.existsSync(filePath))
            formatPath = filePath;
        else
            error = "No file at the path: " + filePath;
    }
    else
    {
        // Load a standard format
        if (path.extname(filePath) === ".json")
            filePath = path.basename(filePath, ".json");

        formatPath = path.resolve(path.join(__dirname, "..", "formats", filePath + ".json"));

        if (!fs.existsSync(formatPath))
        {
            error = "No such format: \"" + filePath + "\"";
            error += "\nAvailable formats: " + availableFormats().join(", ");
        }
    }

    var format = null;

    if (!error)
    {
        try
        {
            if (fs.statSync(formatPath).isFile())
            {
                var json = JSON.parse(fs.readFileSync(formatPath));
                format = new Format(json);
            }
            else
                error = "Not a file: " + formatPath;
        }
        catch (e)
        {
            error = "Invalid JSON in format file: " + formatPath + "\n" + e.message;
        }
    }

    if (error)
        throw new Error(error);

    return format;
};