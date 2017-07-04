# Implementing hash()
## It's easier than you think

## Introduction

Almost every programmer knows what a hash function does. Its less common that a programmer knows how to implement one. 

Contrary to popular belief implementing a hash function does not require the use of large prime-numbers and modulo arithmetic. In fact, many hash functions use very simple math. To implement a hash function all you need to do is satisfy 2 requirments.

## Requirements of `hash()`

There are only 2 requirements for implementing hash():

1. If two objects are equal their hashes must also be equal. `a.isEqualTo(b) == true` implies `a.hash() == b.hash()`
2. If the hashes of two objects are equal it does not mean the objects are equal. `a.hash() == b.hash()` does not imply `a.isEqualTo(b) == true`

These requirements create an implicit 3rd requirement: If you override hash(), you must also override the isEqualTo() to matce and vice-versa.

The first requirement is easy to understand. If there are two equal objects — lets say two empty arrays `a = [], b = []` — their hashes should be equal. `a.hash() == b.hash()`.

The second requirement is more tricky to understand. Lets say I have two arrays `a = [1]` and `b = [123]`. Requirement 2 says that the hashes for these objects *might* be the same. If they are different we immediately know these objects are not equal. If the hashes are the same, we need to use `isEqualTo()` to determine if these objects are actually the same. 

In other words, requirement 2 states that hash functions allow for collisions; Two different objects are allowed to map to the same value.

These are the only two requirements for hash functions. All other qualities are nice-to-haves. A *good* hash function might be more performant to use than a *bad* one even if both are correct. 

## Challenge 1

Now that you know all there is to know about implementing a correct hash function I have a challenge for you. Is the following hash implementation correct?

```
// partial pseudo code for an Array class.
class Array {
	// ...
	int hash() {
		return this.count
	}
	bool isEqualTo(Array obj) {
		if (!obj) {
			return false;
		}
		if (this.count != obj.count) {
			return false;
		}
		for (int i=0; i<this.count; i++) {
			if (!this[i].isEqualTo(obj[i])) {
				return false;
			}
		}
		return true;
	}
}
```
ANSWER BELOW

ANSWER BELOW

ANSWER BELOW

ANSWER BELOW


Answer: Yes! 

It meets requirement 1: if two arrays are equal they must have the same count. 

It meets requirement 2: if two different arrays have the same count they hash to the same value, but isEqualTo() returns false.

Maybe you think of this as a contrived example. *No standard-library actually implements their hash functions this way. It is too simple!*

Actually this is precisely how hash() is implemented for the NSArray class used in ObjC. NSArray comes from the Foundation framework and is essentially a wrapper for CFArray from the CoreFoundation framework. CoreFoundation is open-source so you can [verify this is true](https://github.com/opensource-apple/CF/blob/master/CFArray.c#L275). `__CFArrayHash()` Just returns the number of elements in the array.

## Challenge 2

Another challenge for you. Is the following implementation correct? 

```

class Person {
	String name;
	int age;
	
	int hash() {
		return 0;
	}
	bool isEqualTo(Person obj) {
		if (!obj) {
			return false;
		}
		if (!this.name.isEqualTo(obj.name)) {
			return false;
		}
		if (!this.age.isEqualTo(obj.age)) {
			return false;
		}
		return true;
	}
}

```

ANSWER BELOW

ANSWER BELOW

ANSWER BELOW

ANSWER BELOW


Answer: Yes! 

Requirement 1: If two Person objects are equal their hashes will be equal because they are always `0`. 

Requirment 2: If two Person objects are different, their hash values will be the same (always `0`), but isEqualTo() will return false. 

While this implementation is correct, it can lead to inefficiencies. If this object were used as a key in a hash table, every insertion would result in a collision. Whenever there is a collision, hash tables use a linear search using `isEqualTo()` to determine which key is the right one. That means that using this object as a hash-table key would make look-ups O(N) instead of close to O(1).

## XOR Implementation

By now you should have a solid understanding of what a correct hash() implementation looks like. Sometimes hash implementations are more complex than just returning `this.count` or `0`. A complex object might use the hash values of its properties to compute its hash. 

```
class ComplexObject
	int num
	String str
	Array arr
	int hash() {
		return num.hash() ^ str.hash() ^ arr.hash()
	}
	bool isEqualTo(ComplexObject obj) {
		if (!obj) {
			return false
		}
		return this.num.isEqualTo(obj.num) && this.str.isEqualTo(obj.str) && this.arr.isEqualTo(obj.arr);
	}

```

`XOR` is typically used to combine hash values because it is simple and results in a more uniform distribution than other operators like addition, mutliplication, etc.

One caveat to using `XOR` is that if two properties (p1 and p2) always have the same hash value, `xor` them together always results in `0`. If `p1.hash() == p2.hash()`, `p1.hash() ^ p2.hash()` always equals `0`. 

If you data structure has two NSArrays that must have the same-length, `xor`ing the hashes together will always result in 0. Remember that the hash function for NSArray just returns its count.

One way to solve this problem is to just return the hash of one array. Alternatively you can use a bit shift to mitigate the problem. `p1.hash() ^ (p2.hash() << 8)` returns a good hash value even when `p1.hash() == p2.hash()`.

## Conclusion. 

Implementing `hash()` does not have to be difficult. So long as an implementation meets two requirements, it is guaranteed to be correct. Keep in mind that a correct implementation is not necessarily an effiencient one. For example, an object that always returns `0` as its hash is correct, but causes a hashtable to use O(N) lookups when used as a key. A simple way to implement a correct, well-distributed hash function is to `xor` the hash values of an objects properties. This approach is not perfect, but its easy to mitigate its problems.

I hope you now have a better understanding of how to implement hash() functions. Let me know what you thought of this write-up. I would love to hear from you regardless of whether you have positive or negative feedback.
