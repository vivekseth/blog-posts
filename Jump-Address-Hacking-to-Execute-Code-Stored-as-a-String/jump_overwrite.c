#include <stdio.h>

/*

# Jump Address Hacking to Execute Code Stored as a String

Operating systems typically give each process a virtual address space ranging from 0x0000000000000000 to 0xffffffffffffffff on a 64bit machine. This memory range is divded up in muliple sections. Usually there are at least two: .DATA and .TEXT.

Memory in .DATA is read/write, but cannot be executed. Similarly, memory in .TEXT is read/exec but cannot be written to. This security measure is called "W xor X" and prevents a malicious user from injecting *new* code into a running process. This does not prevent a malicious user from manipulating a program to run code that *already exists* when it shouldn't. 

This program is a demonstration of using jump address hacking to execute code stored in the string constant `execString`. This works because GCC puts string constants in the .TEXT section, the executable part of memory.

`execString` is approximately equivalent to the code below with modifications to avoid null bytes in the machine code.

    long str = 0x0A47464544434241; // "ABCDEFG\n"
    write(1, &str, 8);
    exit(0);

If this program works properly you should see it print "ABCDEFG" and then exit with a return code of 0. 

========

This program was tested on a 2013 Macbook Air running 10.12.6 (16G29) and compiled with `$ gcc jump_overwrite.c`

`$ gcc -v` returns the following: 
Configured with: --prefix=/Applications/Xcode.app/Contents/Developer/usr --with-gxx-include-dir=/usr/include/c++/4.2.1
Apple LLVM version 9.0.0 (clang-900.0.37)
Target: x86_64-apple-darwin16.7.0
Thread model: posix
InstalledDir: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin

*/

char *execString = 
"\x55\x48\x89\xe5\x48\xc7\xc2\x0b\xff\xff\xff\x48\x81\xea\x01\xff"
"\xff\xff\x48\x29\xd4\x41\xba\x05\x01\x01\x03\x49\x81\xea\x01\x01"
"\x01\x01\x4c\x89\xd0\x41\xba\x02\x01\x01\x01\x49\x81\xea\x01\x01"
"\x01\x01\x4c\x89\xd7\x48\xb9\x41\x42\x43\x44\x45\x46\x47\x0a\x49"
"\x89\xe8\x49\x29\xd0\x49\x89\x08\x48\x89\xee\x48\x29\xd6\x41\xba"
"\x09\x01\x01\x01\x49\x81\xea\x01\x01\x01\x01\x4c\x89\xd2\x0f\x05"
"\x41\xba\x02\x01\x01\x03\x49\x81\xea\x01\x01\x01\x01\x4c\x89\xd0"
"\x41\xba\x01\x01\x01\x01\x49\x81\xea\x01\x01\x01\x01\x4c\x89\xd7"
"\x0f\x05";

void runStringAsCode(void) {
    char stackVar = 'X';
    char *jumpAddress = &stackVar+1+8;
    *((unsigned long *)(jumpAddress)) = (unsigned long)execString;
}

void test(void) {
    runStringAsCode();
}

int main() {
    test();

    printf("%s\n", "Jump address overwrite failed.");

    return 0;
}
