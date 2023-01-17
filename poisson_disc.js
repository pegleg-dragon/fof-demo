function distance(obj1, obj2)
{
    var dx = obj2.x - obj1.x;
    var dy = obj2.y - obj1.y;
    return Math.sqrt(dx*dx + dy*dy)
}

function poisson_disc_sample(width, height, num_points)
{
    //debugger;
	sample_rejection_limit = 30;  // k from Bridson 
	// Normal poisson disc sampling takes r (minimum distance between points)
	// as an input, and the number of points is flexible. I want to invert
	// this, since the number of points (flowers) is in our case an important
	// constraint.  So estimate it as a (W x H) / N grid:
    // This means that we get get a little less than num_points in the output.
	let min_sep = Math.sqrt(width * height / num_points);
    let FUDGE_FACTOR = 0.83;  // accounting for width of the flowers themselves.
    min_sep = min_sep * FUDGE_FACTOR;
    //console.log("min_sep: " + min_sep);

	let output_points = [];
	let active_points = [];
	let cell_size = min_sep / Math.sqrt(2);  // No two points possible in the same cell
	// Initialize grid, fill with -1 sentry values.
	let grid_width = Math.ceil(width/cell_size) + 1;
	let grid_height = Math.ceil(height/cell_size) + 1;
	let grid = new Array(grid_width).fill(null).map(() => new Array(grid_height).fill(null));

	function Point(x, y) { return {'x': x, 'y': y}};
    function ptstr(point) { return Math.floor(point.x) + "," + Math.floor(point.y); };
	function insert_point_into_grid(point) {
        let grid_x = Math.floor(point.x / cell_size);
        let grid_y = Math.floor(point.y / cell_size);
		grid[grid_x][grid_y] = point;
	}

	function is_on_screen(point) {
		// TODO: account for flower size, so no flower is only partially on-screen
		return (point.x > 0) && (point.y > 0) && (point.x < width) && (point.y < height);
	}

	function is_far_enough_from_existing_points(point) {
		// Use the grid to limit the search.  Only need to check the cell
		// containing the x,y, plus the eight surrounding cells.
		let pt_x_cell = Math.floor(point.x / cell_size);
		let pt_y_cell = Math.floor(point.y / cell_size);
		// Bound the full 9-cell grid region to check at the edges.
		let min_x_cell = Math.max(pt_x_cell - 1, 0);
		let max_x_cell = Math.min(pt_x_cell + 1, grid_width - 1);
		let min_y_cell = Math.max(pt_y_cell - 1, 0);
		let max_y_cell = Math.min(pt_y_cell + 1, grid_height - 1);
		// Check all cells in scope
		for (let x_cell = min_x_cell; x_cell <= max_x_cell; x_cell++) {
			for (let y_cell = min_y_cell; y_cell <= max_y_cell; y_cell++) {
				if (grid[x_cell][y_cell] != null) {
					// There is already a point in this cell.
					if (distance(point, grid[x_cell][y_cell]) < min_sep) {
                        //console.log("Too close (" + distance(point, grid[x_cell][y_cell]) + ") to point " + ptstr(grid[x_cell][y_cell]));
						return false;
					}
				}
			}
		}
		// No grid cell at or adjacent to the candidate point contained a
		// point less than min_sep from it. This point is good to include.
		return true;
	}

	let first_point = Point(Math.random() * width, Math.random() * height);
	insert_point_into_grid(first_point);
	output_points.push(first_point);
	active_points.push(first_point);

	while(active_points.length > 0) {
		// Choose a random active point
		let center_point_index = Math.floor(Math.random() * active_points.length);
		var center_point = active_points[center_point_index];
		// Sample from points between r and 2r away, until we find a new point
		// that is at least r from any existing point.
		let found = false;
		for (let i=0; i < sample_rejection_limit; i++) {
			// Sample from the donut centered on p with inner radius r and outer 2r
			let theta = Math.random() * Math.PI * 2;
			let radius = (Math.random() * min_sep) * 2;
			// Convert from polar to x,y centered on the chosen active center point
			let candidate_point = Point(
				center_point.x + radius * Math.cos(theta),
				center_point.y + radius * Math.sin(theta)
			);
            //console.log("candidate point is " + ptstr(candidate_point));
            //console.log("on_screen?: " + is_on_screen(candidate_point));
            //console.log("far_enough: " + is_far_enough_from_existing_points(candidate_point));
			if (is_on_screen(candidate_point) &&
				is_far_enough_from_existing_points(candidate_point)) {
				found = true;
				output_points.push(candidate_point);
				active_points.push(candidate_point);
				insert_point_into_grid(candidate_point);
				break;
			}
		}
		// If no good point is found after we've tried the maximum number of times (k),
		// give up and remove the current point from the active list.
		if (!found) {
			// Removes one element from the array at the given index
			active_points.splice(center_point_index, 1);
		}
	}
    return output_points;
}

console.log('loaded poisson_disc.js');