/**
 * Structured Data Validator
 * 
 * This utility provides tools to validate structured data against Google's Rich Results Test
 * and other Schema.org validation services.
 * 
 * Use this during development to ensure your structured data is correctly formatted
 * and will be properly recognized by search engines.
 */

/**
 * Validates structured data against Google's Rich Results Test
 * 
 * @param jsonLd The structured data to validate
 * @returns A URL to the Google Rich Results Test with the structured data pre-filled
 */
export const validateWithGoogleRichResults = (jsonLd: Record<string, any>): string => {
  // Convert the JSON-LD to a string and encode it for URL
  const encodedData = encodeURIComponent(JSON.stringify(jsonLd));
  
  // Return the URL to the Google Rich Results Test with the data pre-filled
  return `https://search.google.com/test/rich-results?url=https://mysticbanana.com&user_agent=2&html=${encodedData}`;
};

/**
 * Validates structured data against Schema.org's Validator
 * 
 * @param jsonLd The structured data to validate
 * @returns A URL to the Schema.org Validator with the structured data pre-filled
 */
export const validateWithSchemaOrg = (jsonLd: Record<string, any>): string => {
  // Convert the JSON-LD to a string and encode it for URL
  const encodedData = encodeURIComponent(JSON.stringify(jsonLd));
  
  // Return the URL to the Schema.org Validator with the data pre-filled
  return `https://validator.schema.org/#url=data:text/html;charset=utf-8,${encodedData}`;
};

/**
 * Checks if the structured data contains all required properties for a specific type
 * 
 * @param jsonLd The structured data to check
 * @param type The Schema.org type to check against
 * @param requiredProps The required properties for the type
 * @returns An object with validation results
 */
export const checkRequiredProperties = (
  jsonLd: Record<string, any>, 
  type: string, 
  requiredProps: string[]
): { valid: boolean; missingProps: string[] } => {
  // Check if the type matches
  if (jsonLd['@type'] !== type) {
    return { 
      valid: false, 
      missingProps: [`Expected type "${type}" but found "${jsonLd['@type']}"`] 
    };
  }
  
  // Check for required properties
  const missingProps = requiredProps.filter(prop => !jsonLd[prop]);
  
  return {
    valid: missingProps.length === 0,
    missingProps
  };
};

/**
 * Predefined required properties for common Schema.org types
 */
export const requiredPropertiesByType = {
  Article: ['headline', 'author', 'datePublished'],
  PodcastSeries: ['name', 'url'],
  PodcastEpisode: ['name', 'datePublished'],
  FAQPage: ['mainEntity'],
  Product: ['name', 'offers'],
  Course: ['name', 'provider'],
  BreadcrumbList: ['itemListElement'],
  CollectionPage: ['name', 'mainEntity']
};

/**
 * Helper function to log structured data validation issues to the console
 * 
 * @param jsonLd The structured data to validate
 * @param type The Schema.org type to validate against
 */
export const logValidationIssues = (jsonLd: Record<string, any>, type: string): void => {
  if (!jsonLd) {
    console.error('No structured data provided for validation');
    return;
  }
  
  // If type is provided and we have predefined required properties for it
  if (type && requiredPropertiesByType[type as keyof typeof requiredPropertiesByType]) {
    const requiredProps = requiredPropertiesByType[type as keyof typeof requiredPropertiesByType];
    const result = checkRequiredProperties(jsonLd, type, requiredProps);
    
    if (!result.valid) {
      console.error(`Structured data validation failed for type "${type}":`, result.missingProps);
    } else {
      console.log(`Structured data for "${type}" is valid!`);
    }
  } else {
    // Basic validation
    if (!jsonLd['@context'] || jsonLd['@context'] !== 'https://schema.org') {
      console.error('Missing or invalid @context property. Should be "https://schema.org"');
    }
    
    if (!jsonLd['@type']) {
      console.error('Missing @type property');
    }
  }
  
  // Generate validation URLs
  console.log('Validate with Google Rich Results Test:', validateWithGoogleRichResults(jsonLd));
  console.log('Validate with Schema.org Validator:', validateWithSchemaOrg(jsonLd));
};
