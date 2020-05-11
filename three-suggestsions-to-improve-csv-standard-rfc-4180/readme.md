# Three suggestions to improve the CSV “Standard” (RFC 4180)

## Introduction 

In [RFC 4180](https://tools.ietf.org/html/rfc4180) the IETF clearly states that the document “does not specify an Internet standard of any kind.” Even so, RFC 4180 feels like people consider it to be an internet standard. 

When you search for “CSV Standard” nearly all of the results on google are about RFC 4180. Wikipedia’s article on CSV [lists RFC 4180 as the “standard” for CSV](https://en.wikipedia.org/wiki/Comma-separated_values) (see the sidebar). On the US Government’s "The Sustainability of Digital Formats Web" [RFC 4180 is listed as the only format for CSVs](https://www.loc.gov/preservation/digital/formats/fdd/dataset_fdd.shtml). Even the IANA, the organization responsible for defining the meaning of MIME Types [lists RFC 4180 as the official reference for the type “text/csv”](https://www.iana.org/assignments/media-types/media-types.xhtml#table-text). Although RFC 4180 claims not to define a standard, it sure feels like people treat it like one. 

Given the popularity of the format, its unfortunate that it suffers from 3 major flaws which (in my opinion) make it unsuitable as a real standard for CSVs. Fortunately, each of these issues can be addressed with minor tweaks to the format and these tweaks have already been made in the CSV format recommended by the W3C. 

The rest of the article assumes a very basic understanding of how formal grammars work. Even if you don’t understand how formal grammars work, I think most of this article will still make sense to you. If you would like to learn more about grammars, [here is a good guide](http://matt.might.net/articles/grammars-bnf-ebnf/).

## RFC 4180 Grammar

Here is the full RFC 4180 grammar for you to reference while reading the article.

```
file        ::= [header CRLF] record *(CRLF record) [CRLF]
header      ::= name *(COMMA name)
record      ::= field *(COMMA field)
name        ::= field
field       ::= (escaped | non-escaped)
escaped     ::= DQUOTE *(TEXTDATA | COMMA | CR | LF | 2DQUOTE) DQUOTE
non-escaped ::= *TEXTDATA
COMMA       ::= %x2C ; (,)
CRLF        ::= CR LF ;
CR          ::= %x0D ; (\r)
LF          ::= %x0A ; (\n)
DQUOTE      ::=  %x22 ; (")
TEXTDATA    ::=  %x20-21 | %x23-2B | %x2D-7E ; Includes all printable ASCII characters except for COMMA, and DQUOTE
```

## Issue 1: The format assumes ASCII characters.

In RFC 4180, field data is limited to just the following byte range: 

```
TEXTDATA = %x20-21 / %x23-2B / %x2D-7E
```

This range includes all printable ASCII characters except for `COMMA`, and `DQUOTE`. If we follow the format exactly as it is written, characters from foreign languages like Chinese/Hindi and emojis would not allowed in valid CSVs. 

Maybe in 2005 an ASCII-only format was okay, but today I believe that CSVs must support the full range of unicode characters. Anything less would be unfair to the billions of people in the world for whom English is not a native language. 

To solve this issue we merely need to change the format definition to require UTF-8 Text. UTF-8’s definition of a character (aka an “extended grapheme clusters”) is actually a multibyte value that represents 1 atomic unit of text. Under UTF-8, “a” is a character, and so is “😀” even though the emoji is actually 4 bytes long. Once we make the change to UTF-8, we can update the grammar as follows to fix the issue: 

```
TEXTDATA = ^(“,#x0A#x0D)
```

This says that any unicode character, including hindi characters, chinese characters, etc, is allowed except for `DQUOTE`, `LF`, `CR`. These characters are only allowed in escaped fields, which begin and end with a `DQUOTE`.

## Issue 2: Unix-style newlines are not supported. 

On Windows newlines are typically represented with 2 characters `CR LF (\r\n)`. On Unix-based systems like macOS newlines are represented as simply `LF (\n)`. 

Despite this difference between conventions on different operating systems, RFC 4180 requires all rows to be terminated with a Windows style `CRLF`. This means that users on Unix-based systems will not be able to edit/create CSVs in a standard text editor. They will need to use a special editor that can be configured to use the correct line ending. In my opinion, this is unfair to macOS/Unix system users, and this is an unnecessary constraint. If the line ending constraint was loosened to allow either `LF` or `CRLF`, both macOS, Unix, and Windows users would be able to edit/create CSVs without ever having to worry about which line ending style they are using. 

To fix this issue we simply need to update the grammar to allow line endings to be either a `LF` or `CRLF`: 

```
file = [header NEWLINE] record *(NEWLINE record) [NEWLINE]
NEWLINE = [CR] LF
```

## Issue 3: Fields cannot have leading or trailing whitespace. 

According to RFC 4180 this CSV is valid

```
“First”,”Last”,”House”
“Harry”,”Potter”,”Gryffindor”
“Draco”,”Malfoy”,”Slytherin”
"Luna","Lovegood","Ravenclaw"
"Newton","Scamander","Hufflepuff"
```

But this CSV is not: 

```
"First",  "Last",      "House"
"Harry",  "Potter",    "Gryffindor"
"Draco",  "Malfoy",    "Slytherin"
"Luna",   "Lovegood",  "Ravenclaw"
"Newton", "Scamander", "Hufflepuff"
```

According to the RFC, users cannot add extra whitespace to make a CSV easier to read.

I don’t see any strong technical reason for not allowing whitespace between fields in a CSV. It is a common convention in most programming languages to allow arbitrary whitespace between elements in an array definition. Allowing extra whitespace does make the grammar slightly more complex, but I think that this extra complexity is worth it because it allows users to make documents significantly easier to read.

One potential issue with allowing leading/trailing whitespace is that it makes it tricky to determine how to parse this CSV: 

```
First,  Last,      House
Harry,  Potter,    Gryffindor
Draco,  Malfoy,    Slytherin
Luna,   Lovegood,  Ravenclaw
Newton, Scamander, Hufflepuff
```

Since there are no quotes it is slightly unclear how to parse the fields. For example, Should the 2nd column be parsed as `"Last"` or as `"  Last"`? 

To keep things simple, I would suggest stripping leading/trailing whitespaces for both quoted and non-quoted strings. In this case, that would mean the 2nd column would be `“Last”`. If users want to include leading/trailing whitespace in a field they can always use quotes to be explicit about where the field should end and begin. 

To fix this issue we can update the grammar as follows: 

```
field = WS* (escaped / non-escaped) WS* 
WS = [#x20#x09]
```

This says that whitespace (`WS`) is defined as either a “space” or a “horizontal tab” and that fields can be surrounded by any amount of whitespace. 

## Why doesn’t a better CSV format exist? 

Since these issues are so significant and so easy to fix, isn’t it strange that no one has proposed a new format that fixes these issues? 

Actually, In December 2015 the W3C has recommended a new best practice format for CSVs that fixes each of the issues I have identified ([https://www.w3.org/TR/2015/REC-tabular-data-model-20151217/#ebnf](https://www.w3.org/TR/2015/REC-tabular-data-model-20151217/#ebnf)).

Although the W3C’s format is significantly better than the IETF’s format, they don’t really discuss any of their reasons for making changes to the RFC 4180 format. The document just mentions that the new format is a “generalization of that defined in [RFC4180]”, and that it “is not compliant with text/csv as defined in [RFC4180] in that it permits line endings other than CRLF.” Basically, the W3C has designed a CSV format that is compatible with RFC 4180, and fixes each of its major issues. 

Here is the new grammar: 

```
csv      ::= header record+
header   ::= record
record   ::= fields #x0D? #x0A
fields   ::= field ("," fields)*
field    ::= WS* rawfield WS*
rawfield ::= '"' QCHAR* '"' |SCHAR*
QCHAR    ::= [^"] |'""'
SCHAR    ::= [^",#x0A#x0D]
WS       ::= [#x20#x09]
```

Although this grammar uses slightly different terms, it is effectively the same format as RFC 4180 with the modifications suggested in this article. 

## Conclusion 

Although some people treat RFC 4180 as if it is a standard, it is not a standard and has significant flaws that prevent it from becoming one. The format recommended by the W3C manages to fix these flaws using only minor changes to RFC 4180’s grammar. The resulting format is RFC 4180 compatible, and also fixes each of the issues I have identified in this post.

For anyone writing software that will either read or write CSVs I would suggest considering using the w3c CSV recommendation instead of that of RFC 4180. 

## References

1. https://tools.ietf.org/html/rfc4180
2. https://www.w3.org/TR/2015/REC-tabular-data-model-20151217/#ebnf
3. https://www.iana.org/assignments/media-types/media-types.xhtml#table-text
4. https://en.wikipedia.org/wiki/Comma-separated_values
5. https://www.loc.gov/preservation/digital/formats/fdd/dataset_fdd.shtml
6. https://docs.swift.org/swift-book/LanguageGuide/StringsAndCharacters.html#ID296
7. https://manishearth.github.io/blog/2017/01/14/stop-ascribing-meaning-to-unicode-code-points/
8. http://matt.might.net/articles/grammars-bnf-ebnf/

## Feedback?

Thank you for reading this post! I’m trying to become a better writer and would love feedback on this post whether it is positive or negative. 

Feel free to reach out via email (vivekseth.m@gmail.com), twitter (@viveks3th), or github via an issue on the repo. 



