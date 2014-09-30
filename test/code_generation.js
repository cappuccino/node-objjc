/*
 * code_generation.js
 *
 * Created by Aparajita Fishman.
 * Copyright 2014, Aparajita Fishman.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the MIT license (http://opensource.org/licenses/MIT).
 */

"use strict";

/*global describe, it */
/*eslint-disable max-nested-callbacks */

var utils = require("./lib/utils");

describe("Code generation", function() {
    describe("@[] array literal", function() {
        it("should generate Objective-J code", function() {
            utils.compareWithFixture("code/array-literal");
        });
    });

    describe("class declaration", function() {
        it("should generate well-formatted and commented code for ivars, instance methods and class methods", function() {
            utils.compareWithFixture("code/class-declaration");
        });
    });

    describe("accessors", function() {
        it("should be generated according to attributes", function() {
            utils.compareWithFixture("code/accessors");
        });
    });

    describe("protocols", function() {
        it("should generate Objective-J code", function() {
            utils.compareWithFixture("code/protocols");
        });
    });

    describe("message send", function() {
        it("should generate msgSend[N] calls and temp vars", function() {
            utils.compareWithFixture("code/message-send");
        });
    });

    describe("@selector", function() {
        it("should generate sel_getUid calls", function() {
            utils.compareWithFixture("code/@selector");
        });
    });

    describe("@protocol", function() {
        it("should generate objj_getProtocol calls", function() {
            utils.compareWithFixture("code/@protocol");
        });
    });
});