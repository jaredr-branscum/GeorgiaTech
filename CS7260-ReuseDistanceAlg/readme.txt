Based on the paper AIm - Calculating Stack Distances Efficiently

Source Code Breakdown

Sources:
https://www.sanfoundry.com/cpp-program-implement-avl-trees/
is the base source for where I found an avl tree implementation.
I used https://www.geeksforgeeks.org/avl-tree-set-2-deletion/
as my source for the deletion node function but it required several modifications.
The AVL convention used is that the most recently used address is inserted
at the very right leafnode.

Augmented Data Structure: AVL-tree
Invariants:
1. each node contains number of nodes underneath it in tree structure
2. nodes are InOrder and the distinct addresses are mapped to the augmented data structure using the standard STL map
3. each node contains the latest access time in the trace the memory address was used

By maintaining these invariants, we can find the reuse distance.
We do this like so:

For each incoming read memory address from trace:
	search map if memory address is already in it O(logN) time
		if address is in the map, return latest time of access
		compute reuse distance
		delete the node from the augmented tree
		reinsert the memory address into the tree at the new access time

The search function in the code is the most important function.
The rest of the functions are either for statistical purposes or AVL functions.

How to Find the Reuse Distance:
start from the root and traverse downwards until you find the node in the tree
while traversing down, if you go left, add the count from the right subtree. If it doesn't exist, simply add 1.
If you traverse right, keep going right and don't add to reuse distance.
Once you arrive at the node, add the count from the right subtree again if it exists.
Otherwise, return distance. The reuse distance is found recursively
and runs in O(logN) time because we only explore logN nodes of the inOrder AVL tree.

Major modifications to the Base AVL Tree:
1. The Height Function
	The original function computed the height of the tree in O(N) time.
	However with Invariant #1, I could modify the function to find the height of the tree in O(1) time by taking the max count
	between the two child nodes.
2. RR/LL rotation Functions
	These functions required modifying the count parameter within the affected nodes
	because the rotations change the number of nodes underneath them.
	The modifications still preserve the original AVL's rotation complexity of O(logN).
3. Insert/delete_node functions
	The insert function was modified to initialize new nodes with the count invariant and latest access time invariant.
	In addition, whenever a new node is added, the pointer to this node is inserted into the map.
	The original functions were modified to traverse the tree through access time rather than the data parameter.
	The count of the nodes is made recursively.
	The complexity of the function of O(logN) is preserved here as well.
	
	The delete function was modified by modifying the count recursively
	whenever a node is deleted. Furthermore, the map is updated because
	the pointer to the child node or minValueNode becomes invalid, so this
	update needs to be reflected in the map.

There's some commented out code that was used for testing purposes and exploring different approaches
to augmenting the data structure.

Observations:
I originally made O(N) functions to find the height of the tree and maintain
the count invariant. After forgetting to modify the height function,
I struggled to understand why the program was running very inefficiently.
This O(N) algorithm caused the program to spend 1.5 hours to process only 30 million memory addresses.
A very inefficient implementation that would take over 1000 days.
After resolving this issue, the program ran very quickly and was able to process about a million memory addresses
per second as shown by classmates on Piazza. The most challenging aspect of this assignment
was mapping the map structure to the augmented AVL tree. This was particularly challenging for me
because debugging the memory was tricky and very time consuming. Furthermore,
modifying the rotation functionality to maintain the count invariant was also
a task that took a bit of time. Overall, this was an awesome learning experience and I'm glad
to have partaken in this course.