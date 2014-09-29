var foo = bar;

// @implementation Test
var $the_class = objj_allocateClassPair(Nil, "Test");
objj_registerClassPair($the_class);

// Instance methods
class_addMethods($the_class,
[    
    // -test:
    new objj_method(sel_getUid("test:"),    
    function $Test__test_(self, _cmd, arg)
    {
        console.log(arg);
    },
    // argument types
    ["void", "int"]),
    
    // -test:
    new objj_method(sel_getUid("test:"),    
    function $Test__test_(self, _cmd, arg)
    {
    },
    // argument types
    ["int", "float"]),
]);
// @end: @implementation Test

// @implementation Foo
var $the_class = objj_allocateClassPair(Nil, "Foo");
objj_registerClassPair($the_class);

class_addIvars($the_class,
[    
    new objj_ivar("name", "CPString"),
]);
// @end: @implementation Foo

"bar";

var BarCount = 0;

// @implementation Bar : Foo
var $the_class = objj_allocateClassPair(Foo, "Bar");
objj_registerClassPair($the_class);

class_addIvars($the_class,
[    
    new objj_ivar("firstName", "CPString"),    
    new objj_ivar("lastName", "CPString"),
]);

// Instance methods
class_addMethods($the_class,
[    
    // -fullName
    new objj_method(sel_getUid("fullName"),    
    function $Bar__fullName(self, _cmd)
    {
        return self.firstName + " " + self.lastName;
    },
    // argument types
    ["CPString"]),
    
    // -addContactWithFirstName:lastName:
    new objj_method(sel_getUid("addContactWithFirstName:lastName:"),    
    function $Bar__addContactWithFirstName_lastName_(self, _cmd, first, last)
    {
        self.firstName = first;
        self.lastName = last;
        BarCount++;
    },
    // argument types
    ["CPString", "CPString", "CPString"]),
]);

// Class methods
class_addMethods($the_class.isa,
[    
    // +contactCount
    new objj_method(sel_getUid("contactCount"),    
    function $Bar__contactCount(self, _cmd)
    {
        return BarCount;
    },
    // argument types
    ["int"]),
]);
// @end: @implementation Bar : Foo

// @implementation FooBar (Foo)
var $the_class = objj_getClass("FooBar");

if (!$the_class)
    throw new SyntaxError("Undefined class: FooBar");

// @end: @implementation FooBar (Foo)

// @class Superclass

// @implementation Subclass : Superclass
var $the_class = objj_allocateClassPair(Superclass, "Subclass");
objj_registerClassPair($the_class);
// @end: @implementation Subclass : Superclass

"foobar";
