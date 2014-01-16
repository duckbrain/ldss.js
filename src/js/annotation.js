// This file will provide a uniform way to modify annotations online and
// offline. It will be run on the background page and will expose a
// messaging system to communicate with the API.
//
// This will allow us to provide a layer of transparency with the rest
// of the app as well as modularize the code to be used in other
// applications.
//
// The API will expose three objects with identical methods to control
// data, but one will access local storage and another will access the
// Church's website AJAX API. The final one will do nothing more then
// wrap the other two to provide a transparent way to access the proper
// one based on if the permissions are set and the user is online. It
// will also add a method to do a sync if the conditions are right.
//


AnnotationsOffline = {
// This object will expose functions to store annotations in localStorage
	
}

AnnotationsOnline = {
	// This object will expose functions to control the annotations API
	// on lds.org
	
	//This section contains the methods for communicating with the raw
	// data on lds.org
	GetAnnotationsByParameters: function(locale, url, scope, type, since, status, tag, facets, orderDir, start, numberToReturn)
	{
		
	},

	
	
}

Annotations = {
// This object wraps AnnotationsOffline and AnnotationsOnline to allow it
// to be used anywhere in the app, but not matter if the user is online
// or offline, ensuring that it always works, but defaults to online if
// possible.
// It also contains an extra method to syncronize all data in both to
// have uniform data at all times. It must be called explisitly
// or it will never happen.

	
}
