define(['ojs/ojcore', 'text!./shop-component.html', './shop-component', 'text!./component.json', 'css!./shop-component', 'ojs/ojcomposite'],
    function(oj, view, viewModel, metadata) {
        oj.Composite.register('shop-component', {
            view: {inline: view},
            viewModel: {inline: viewModel},
            metadata: {inline: JSON.parse(metadata)}
        });
    }
);