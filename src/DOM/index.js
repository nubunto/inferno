import DOMRegistry from './DOMRegistry';
import setSelectValueForProperty from './setSelectValueForProperty';
import setValueForStyles from './setValueForStyles';
import review from './review';
import isDataAttribute from './isDataAttribute';
import isAriaAttribute from './isAriaAttribute';

const template = {

    /**
     * Sets the value for a property on a node. If a value is specified as
     * '' (empty string), the corresponding style property will be unset.
     *
     * @param {DOMElement} node
     * @param {string} name
     * @param {*} value
     */
    setProperty(vNode, domNode, name, value, useProperties) {
        const propertyInfo = DOMRegistry[name] || null;

        if (propertyInfo) {
            if (value == null ||
                propertyInfo.hasBooleanValue && !value ||
                propertyInfo.hasNumericValue && (value !== value) ||
                propertyInfo.hasPositiveNumericValue && value < 1 ||
                value.length === 0) {
                template.removeProperty(vNode, domNode, name, useProperties);
            } else {
                const propName = propertyInfo.propertyName;

                if (propertyInfo.mustUseProperty) {
                    if (propertyInfo.mustUseObject && (propName === 'style')) {
                        setValueForStyles(vNode, domNode, value, useProperties)
                    } else if (propName === 'value' && (vNode.tag === 'select')) {
                        setSelectValueForProperty(vNode, domNode, value, useProperties);
                    } else {
                        if (useProperties) {
                            if (review(domNode, propertyInfo, propName, value) ) {
                                domNode[propName] = value;
                            }
                        } else {
                            if (review (domNode, propertyInfo, propName, value) ) {
                                if (propertyInfo.hasBooleanValue && value === true) {
                                    value = propName;
                                }
                                domNode.setAttribute(propName, value);
                            }
                        }
                    }
                } else {
                    const attributeName = propertyInfo.attributeName;
                    const namespace = propertyInfo.attributeNamespace;

                    if (propertyInfo.hasBooleanValue && value === true) {
                        value = attributeName;
                    }

                    if (namespace) {
                        domNode.setAttributeNS(namespace, attributeName, value);
                    } else {
                        domNode.setAttribute(attributeName, value);
                    }
                }
            }
            // HTML attributes and custom attributes
        } else if (name && (name.length > 2)) {
            if (value == null) {
                domNode.removeAttribute(name);
            } else {
                 // data-* and aria attributes should be lowercase;
                if (isDataAttribute(name) || isAriaAttribute(name)) {
                    domNode.setAttribute(name.toLowerCase(), value);
                } else {

                    domNode.setAttribute(name, value);
                }
            }
        }
    },

    /**
     * Removes the value for a property on a node.
     *
     * @param {DOMElement} node
     * @param {string} name
     */
    removeProperty(vNode, domNode, name, useProperties) {
        const propertyInfo = DOMRegistry[name];

        if (propertyInfo) {
            if (propertyInfo.mustUseProperty) {
                let propName = propertyInfo.propertyName;
                if (propertyInfo.hasBooleanValue) {
                    if (useProperties) {
                        domNode[propName] = false;
                    } else {
                        domNode.removeAttribute(propName);
                    }
                    // 'style' and 'dataset' property has to be removed as an attribute
                } else if (propertyInfo.mustUseObject) {
                    domNode.removeAttribute(propName);
                } else {
                    if (useProperties) {
                        if ('' + domNode[propName] !== '') {
                            domNode[propName] = '';
                        }
                    } else {
                        domNode.removeAttribute(propName);
                    }
                }
            } else {
                domNode.removeAttribute(propertyInfo.attributeName);
            }
            // Custom attributes
        } else {
            domNode.removeAttribute(name);
        }
    }
};

export default template;