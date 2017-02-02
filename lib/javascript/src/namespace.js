/** @flow */

const ae = {};

// Public namespaces
ae.core = {};
ae.math = {};
ae.mesh = {};
ae.util = {};

// Private/Internal namespaces
ae.core._p = {};
ae.math._p = {};
ae.mesh._p = {};
ae.util._p = {};

ae.VERSION_MAJOR    = 0;
ae.VERSION_MINOR    = 9;
ae.VERSION_REVISION = 0;

ae.RAD_FACTOR = Math.PI / 180;
ae.DEG_FACTOR = 180 / Math.PI;
