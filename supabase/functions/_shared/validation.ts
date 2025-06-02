// Shared validation utilities for edge functions

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super("Validation failed");
    this.errors = errors;
    this.name = "ValidationException";
  }
}

// Birth data validation
export function validateBirthData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push({
      field: "name",
      message: "Name is required and must be a non-empty string",
    });
  }

  if (!data.birthDate) {
    errors.push({ field: "birthDate", message: "Birth date is required" });
  } else {
    const birthDate = new Date(data.birthDate);
    if (isNaN(birthDate.getTime())) {
      errors.push({
        field: "birthDate",
        message: "Birth date must be a valid date",
      });
    } else if (birthDate > new Date()) {
      errors.push({
        field: "birthDate",
        message: "Birth date cannot be in the future",
      });
    } else if (birthDate < new Date("1900-01-01")) {
      errors.push({
        field: "birthDate",
        message: "Birth date cannot be before 1900",
      });
    }
  }

  if (data.birthTime && typeof data.birthTime === "string") {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(data.birthTime)) {
      errors.push({
        field: "birthTime",
        message: "Birth time must be in HH:MM or HH:MM:SS format",
      });
    }
  }

  if (!data.location || typeof data.location !== "object") {
    errors.push({
      field: "location",
      message: "Location is required and must be an object",
    });
  } else {
    if (!data.location.city || typeof data.location.city !== "string") {
      errors.push({
        field: "location.city",
        message: "City is required and must be a string",
      });
    }

    if (!data.location.country || typeof data.location.country !== "string") {
      errors.push({
        field: "location.country",
        message: "Country is required and must be a string",
      });
    }

    if (
      typeof data.location.latitude !== "number" ||
      data.location.latitude < -90 ||
      data.location.latitude > 90
    ) {
      errors.push({
        field: "location.latitude",
        message: "Latitude must be a number between -90 and 90",
      });
    }

    if (
      typeof data.location.longitude !== "number" ||
      data.location.longitude < -180 ||
      data.location.longitude > 180
    ) {
      errors.push({
        field: "location.longitude",
        message: "Longitude must be a number between -180 and 180",
      });
    }
  }

  return errors;
}

// Chart data validation
export function validateChartData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    errors.push({
      field: "chartData",
      message: "Chart data is required and must be an object",
    });
    return errors;
  }

  if (!Array.isArray(data.planets)) {
    errors.push({
      field: "chartData.planets",
      message: "Planets must be an array",
    });
  } else if (data.planets.length === 0) {
    errors.push({
      field: "chartData.planets",
      message: "At least one planet is required",
    });
  }

  if (!Array.isArray(data.houses)) {
    errors.push({
      field: "chartData.houses",
      message: "Houses must be an array",
    });
  } else if (data.houses.length !== 12) {
    errors.push({
      field: "chartData.houses",
      message: "Exactly 12 houses are required",
    });
  }

  return errors;
}

// Zodiac sign validation
export function validateZodiacSign(sign: string): boolean {
  const validSigns = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  return validSigns.includes(sign);
}

// Date validation
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return (
    !isNaN(date.getTime()) &&
    date <= new Date() &&
    date >= new Date("2020-01-01")
  );
}

// Report type validation
export function validateReportType(type: string): boolean {
  const validTypes = [
    "natal",
    "vedic",
    "transit",
    "compatibility",
    "daily-horoscope",
    "natal-premium",
    "vedic-premium",
    "transit-premium",
  ];
  return validTypes.includes(type);
}

// Premium status validation
export function validatePremiumStatus(isPremium: any): boolean {
  return typeof isPremium === "boolean";
}

// Generic object validation
export function validateRequiredFields(
  obj: any,
  requiredFields: string[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of requiredFields) {
    if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
      errors.push({ field, message: `${field} is required` });
    }
  }

  return errors;
}

// Sanitize input to prevent injection attacks
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>"'&]/g, (match) => {
      const escapeMap: { [key: string]: string } = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return escapeMap[match];
    })
    .trim()
    .substring(0, 10000); // Limit length to prevent DoS
}

// Validate and sanitize user input
export function validateAndSanitizeUserInput(data: any): {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData: any;
} {
  const errors: ValidationError[] = [];
  const sanitizedData: any = {};

  // Recursively sanitize string values
  function sanitizeObject(obj: any): any {
    if (typeof obj === "string") {
      return sanitizeInput(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  }

  try {
    sanitizedData = sanitizeObject(data);
  } catch (error) {
    errors.push({ field: "input", message: "Invalid input format" });
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  };
}
