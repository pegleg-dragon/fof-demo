var seen_outputs = []

function maximally_distant_hue(hues) {
	// We want an output hue that looks as *different* as possible from all the inputs.
	// The common case is two inputs (two waves intersecting). in that case, we find
	// the average of the input hues (clamped to [0-1]), then get the hue opposite it
	// on the hue wheel (clamped to [0-1])
	if (hues.length < 1) {
		return null;
	}

	function clamp_to_0_1(hue) {
		if (hue > 1) {
			return hue - Math.floor(hue);
		}
		if (hue < 0) {
			return hue + Math.ceil(Math.abs(hue));
		}
		return hue;
	}
	let average_hue = hues.reduce((a, b) => a + b, 0) / hues.length;
	average_hue = clamp_to_0_1(average_hue);
	opposite_average_hue = clamp_to_0_1(average_hue + 0.5);

	if (seen_outputs.indexOf(opposite_average_hue) == -1) {
		seen_outputs.push(opposite_average_hue);
		console.log("Input hues: ");
		for (let i=0; i<hues.length; i++) {
			console.log(hues[i]);
		}
		console.log("output mix: ", opposite_average_hue);
	}

	return opposite_average_hue;
}