% One-off check of the candidate: residual is half the lateral force.
correction_angle = wheel_angle + lateral_force * 0.5;
correction_error = abs(correction_angle - wheel_angle);
