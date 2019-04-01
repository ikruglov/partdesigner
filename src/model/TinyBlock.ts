﻿class TinyBlock extends SmallBlock {
	public mergedBlocks = 1;
	public merged = false;

	public angle() {
		return getAngle(this.quadrant);
	}

	public smallBlockPosition(): Vector3 {
		return new Vector3(
			Math.floor((this.position.x + 1) / 3),
			Math.floor((this.position.y + 1) / 3),
			Math.floor((this.position.z + 1) / 3)
		);
	}

	public localPositon(): Vector3 {
		return this.position.minus(this.smallBlockPosition().times(3));
	}
	
	// Returns true if this tiny block is not inside the margin on the right and up axes
	// Being insdide the margin along the forward axis is ok.
	public isCenter(): boolean {
		return this.localPositon().dot(this.up()) == 0 && this.localPositon().dot(this.right()) == 0;
	}

	public getCylinderOrigin(): Vector3 {
		return this.forward().times(tinyIndexToWorld(this.forward().dot(this.position)))
			.plus(this.right().times((this.smallBlockPosition().dot(this.right()) + (1 - this.localX())) * 0.5))
			.plus(this.up().times((this.smallBlockPosition().dot(this.up()) + (1 - this.localY())) * 0.5));
	}

	public getDepth(): number {
		return tinyIndexToWorld(this.forward().dot(this.position) + this.mergedBlocks) - tinyIndexToWorld(this.forward().dot(this.position));
	}

	constructor(position: Vector3, source: SmallBlock) {
		super(source.quadrant, position, source);
	}
}