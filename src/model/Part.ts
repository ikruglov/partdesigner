///<reference path="../geometry/Vector3.ts" />

let CUBE = [
	new Vector3(0, 0, 0),
	new Vector3(0, 0, 1),
	new Vector3(0, 1, 0),
	new Vector3(0, 1, 1),
	new Vector3(1, 0, 0),
	new Vector3(1, 0, 1),
	new Vector3(1, 1, 0),
	new Vector3(1, 1, 1)
];

class Part {
	public blocks: VectorDictionary<Block> = new VectorDictionary<Block>();

	public createSmallBlocks(): VectorDictionary<SmallBlock> {
		var result = new VectorDictionary<SmallBlock>();

		for (let position of this.blocks.keys()) {
			let block = this.blocks.get(position);
			for (let local of CUBE) {
				if (block.forward.dot(local) == 1) {
					continue;
				}
				result.set(position.plus(local), SmallBlock.createFromLocalCoordinates(block.right.dot(local), block.up.dot(local), position.plus(local), block));
			}
		}

		return result;
	}

	public isSmallBlockFree(position: Vector3): boolean {
		for (let local of CUBE) {
			if (!this.blocks.containsKey(position.minus(local))) {
				continue;
			}
			var block = this.blocks.get(position.minus(local));
			if (block.forward.dot(local) == 1) {
				return false;
			}
		}
		return true;
	}

	public clearSingle(position: Vector3) {
		for (let local of CUBE) {
			if (!this.blocks.containsKey(position.minus(local))) {
				continue;
			}
			var block = this.blocks.get(position.minus(local));
			if (block.forward.dot(local) != 1) {
				this.blocks.remove(position.minus(local));
			}
		}
	}

	public clearBlock(position: Vector3, orientation: Orientation) {
		for (let local of CUBE) {
			if (FORWARD[orientation].dot(local) != 1) {
				this.clearSingle(position.plus(local));
			}
		}
	}

	public isBlockPlaceable(position: Vector3, orientation: Orientation, doubleSize: boolean): boolean {
		for (let local of CUBE) {
			if (!doubleSize && FORWARD[orientation].dot(local) == 1) {
				continue;
			}
			if (!this.isSmallBlockFree(position.plus(local))) {
				return false;
			}
		}
		return true;
	}

	public placeBlockForced(position: Vector3, block: Block) {
		this.clearBlock(position, block.orientation);
		this.blocks.set(position, block);
	}

	public toString(): string {
		var result = "";

		if (!this.blocks.any()) {
			return result;
		}

		var origin = new Vector3(min(this.blocks.keys(), p => p.x), min(this.blocks.keys(), p => p.y), min(this.blocks.keys(), p => p.z));

		for (let position of this.blocks.keys()) {
			result += position.minus(origin).toNumber().toString(16).toLowerCase();

			let block = this.blocks.get(position);
			let orientationAndRounded = block.orientation == Orientation.X ? "x" : (block.orientation == Orientation.Y ? "y" : "z");
			if (!block.rounded) {
				orientationAndRounded = orientationAndRounded.toUpperCase();
			}
			result += orientationAndRounded;
			result += block.type.toString();
		}
		return result;
	}

	public static fromString(s: string): Part {
		let XYZ = "xyz";

		let part = new Part();

		var p = 0;
		while (p < s.length) {
			var chars = 1;
			while (XYZ.indexOf(s[p + chars].toLowerCase()) == -1) {
				chars++;
			}
			
			let position = Vector3.fromNumber(parseInt(s.substr(p, chars), 16));
			p += chars;
			let orientationString = s[p].toString().toLowerCase();
			let orientation = orientationString == "x" ? Orientation.X : (orientationString == "y" ? Orientation.Y : Orientation.Z);
			let rounded = s[p].toLowerCase() == s[p];
			let type = parseInt(s[p + 1]) as BlockType;

			part.blocks.set(position, new Block(orientation, type, rounded));
			p += 2;
		}
		return part;
	}

	private getBoundingBox(): [Vector3, Vector3] {
		let defaultPosition = this.blocks.keys().next().value;
		var minX = defaultPosition.x;
		var minY = defaultPosition.y;
		var minZ = defaultPosition.z;
		var maxX = defaultPosition.x;
		var maxY = defaultPosition.y;
		var maxZ = defaultPosition.z;

		for (var position of this.blocks.keys()) {
			var forward = this.blocks.get(position).forward;
			if (position.x < minX) {
				minX = position.x;
			}
			if (position.y < minY) {
				minY = position.y;
			}
			if (position.z < minZ) {
				minZ = position.z;
			}
			if (position.x + (1.0 - forward.x) > maxX) {
				maxX = position.x + (1.0 - forward.x);
			}
			if (position.y + (1.0 - forward.y) > maxY) {
				maxY = position.y + (1.0 - forward.y);
			}
			if (position.z + (1.0 - forward.z) > maxZ) {
				maxZ = position.z + (1.0 - forward.z);
			}
		}
		return [new Vector3(minX, minY, minZ), new Vector3(maxX, maxY, maxZ)];
	}

	public getCenter(): Vector3 {
		if (!this.blocks.any()) {
			return Vector3.zero();
		}

		var boundingBox = this.getBoundingBox();
		var min = boundingBox[0];
		var max = boundingBox[1];
		
		return min.plus(max).plus(Vector3.one()).times(0.5);
	}

	public getSize() {
		var boundingBox = this.getBoundingBox();
		var min = boundingBox[0];
		var max = boundingBox[1];
		return Math.max(max.x - min.x, Math.max(max.y - min.y, max.z - min.z)) + 1;
	}
}