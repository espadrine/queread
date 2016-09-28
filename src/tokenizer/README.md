The tokenizer reads a string of words. It returns a list of words
(potentially with spaces, eg. because `12, 99 €` was a single token, not
a list of three separate words), and for each word, a list of tags that it
maps to, in the form of `{text, tag, type, data}`.

**Warning**: the files in this directory are highly localized. You may need
different primitives for languages other than British English.


