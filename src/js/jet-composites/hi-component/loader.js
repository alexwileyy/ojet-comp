define(['ojs/ojcore', 'text!./hi-component.html', './hi-component', 'text!./component.json', 'css!./hi-component', 'ojs/ojcomposite'],
    function(oj, view, viewModel, metadata) {
        oj.Composite.register('hi-component', {
            view: {inline: view},
            viewModel: {inline: viewModel},
            metadata: {inline: JSON.parse(metadata)}
        });
    }
);