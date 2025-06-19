import { Transform } from 'class-transformer';

/**
 * Transforms 'true' / 'false' string values to boolean.
 * Useful for parsing query parameters.
 */
export const ToBoolean = () =>
	Transform(({ value }) => {
		if (value === 'true') return true;
		if (value === 'false') return false;
		return value;
	});
