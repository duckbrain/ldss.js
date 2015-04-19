/*
	Changes the min number on the ymns index to make the number typing work properly.
 */
function numberJump(database, navigation) {
	database.keyboard.minNumber = -2;
	database.keyboard.maxNumber -= 2;
	database.keyboard.selectedNumber -= 2;
}