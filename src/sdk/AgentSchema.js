/**
 * AgentSchema - Input/output validation for agents
 *
 * Provides schema definition and validation for agent contracts
 */

class AgentSchema {
  /**
   * Validate input against schema
   * @param {*} input - Input to validate
   * @param {Object} schema - Schema definition
   * @throws {Error} If validation fails
   */
  static validateInput(input, schema) {
    if (!schema) {
      return true; // No schema means no validation required
    }

    return this.validate(input, schema, 'input');
  }

  /**
   * Validate output against schema
   * @param {*} output - Output to validate
   * @param {Object} schema - Schema definition
   * @throws {Error} If validation fails
   */
  static validateOutput(output, schema) {
    if (!schema) {
      return true;
    }

    return this.validate(output, schema, 'output');
  }

  /**
   * Generic validation function
   * @param {*} data - Data to validate
   * @param {Object} schema - Schema definition
   * @param {string} context - 'input' or 'output' for error messages
   * @throws {Error} If validation fails
   */
  static validate(data, schema, context = 'data') {
    // Type validation
    const actualType = this.getType(data);

    if (schema.type && actualType !== schema.type) {
      throw new Error(
        `${context} type mismatch: expected ${schema.type}, got ${actualType}`
      );
    }

    // Type-specific validation
    switch (schema.type) {
      case 'object':
        this.validateObject(data, schema, context);
        break;
      case 'array':
        this.validateArray(data, schema, context);
        break;
      case 'string':
        this.validateString(data, schema, context);
        break;
      case 'number':
        this.validateNumber(data, schema, context);
        break;
    }

    // Custom validation function
    if (schema.validate && typeof schema.validate === 'function') {
      const result = schema.validate(data);
      if (result !== true) {
        throw new Error(`${context} validation failed: ${result}`);
      }
    }

    return true;
  }

  /**
   * Validate object against schema
   */
  static validateObject(obj, schema, context) {
    if (typeof obj !== 'object' || obj === null) {
      throw new Error(`${context} must be an object`);
    }

    if (!schema.properties) {
      return true;
    }

    // Check required fields
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (propSchema.required && !(key in obj)) {
        throw new Error(`${context} missing required field: ${key}`);
      }

      // Validate existing fields
      if (key in obj) {
        try {
          this.validate(obj[key], propSchema, `${context}.${key}`);
        } catch (error) {
          throw new Error(`${context}.${key}: ${error.message}`);
        }
      }
    }

    // Check for unknown fields if strict mode
    if (schema.strict) {
      const allowedKeys = Object.keys(schema.properties);
      const actualKeys = Object.keys(obj);
      const unknownKeys = actualKeys.filter(k => !allowedKeys.includes(k));

      if (unknownKeys.length > 0) {
        throw new Error(
          `${context} has unknown fields: ${unknownKeys.join(', ')}`
        );
      }
    }

    return true;
  }

  /**
   * Validate array against schema
   */
  static validateArray(arr, schema, context) {
    if (!Array.isArray(arr)) {
      throw new Error(`${context} must be an array`);
    }

    // Min/max length
    if (schema.minLength !== undefined && arr.length < schema.minLength) {
      throw new Error(
        `${context} length must be at least ${schema.minLength}, got ${arr.length}`
      );
    }

    if (schema.maxLength !== undefined && arr.length > schema.maxLength) {
      throw new Error(
        `${context} length must be at most ${schema.maxLength}, got ${arr.length}`
      );
    }

    // Validate items
    if (schema.items) {
      for (let i = 0; i < arr.length; i++) {
        try {
          this.validate(arr[i], schema.items, `${context}[${i}]`);
        } catch (error) {
          throw new Error(`${context}[${i}]: ${error.message}`);
        }
      }
    }

    return true;
  }

  /**
   * Validate string against schema
   */
  static validateString(str, schema, context) {
    if (typeof str !== 'string') {
      throw new Error(`${context} must be a string`);
    }

    // Min/max length
    if (schema.minLength !== undefined && str.length < schema.minLength) {
      throw new Error(
        `${context} length must be at least ${schema.minLength}, got ${str.length}`
      );
    }

    if (schema.maxLength !== undefined && str.length > schema.maxLength) {
      throw new Error(
        `${context} length must be at most ${schema.maxLength}, got ${str.length}`
      );
    }

    // Pattern matching
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(str)) {
        throw new Error(`${context} does not match pattern: ${schema.pattern}`);
      }
    }

    // Enum values
    if (schema.enum && !schema.enum.includes(str)) {
      throw new Error(
        `${context} must be one of: ${schema.enum.join(', ')}, got "${str}"`
      );
    }

    return true;
  }

  /**
   * Validate number against schema
   */
  static validateNumber(num, schema, context) {
    if (typeof num !== 'number' || isNaN(num)) {
      throw new Error(`${context} must be a number`);
    }

    // Min/max value
    if (schema.minimum !== undefined && num < schema.minimum) {
      throw new Error(
        `${context} must be at least ${schema.minimum}, got ${num}`
      );
    }

    if (schema.maximum !== undefined && num > schema.maximum) {
      throw new Error(
        `${context} must be at most ${schema.maximum}, got ${num}`
      );
    }

    // Integer check
    if (schema.integer && !Number.isInteger(num)) {
      throw new Error(`${context} must be an integer, got ${num}`);
    }

    return true;
  }

  /**
   * Get type of value
   */
  static getType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  /**
   * Create a simple schema
   */
  static createSchema(type, properties = {}) {
    return {
      type,
      properties,
      required: Object.keys(properties).filter(key => properties[key].required)
    };
  }

  /**
   * Merge schemas
   */
  static mergeSchemas(schema1, schema2) {
    return {
      type: schema2.type || schema1.type,
      properties: {
        ...(schema1.properties || {}),
        ...(schema2.properties || {})
      }
    };
  }
}

module.exports = AgentSchema;
