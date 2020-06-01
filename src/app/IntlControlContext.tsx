import React from 'react'

type IntlControlContextValue = {
    locale: string
    changeLocale: (locale: string) => void
}

export const IntlControlContext = React.createContext<IntlControlContextValue>(null)

export function WithIntlControlContextValue<C extends HighOrderWrappedComponentType<IntlControlContextValue, C>>(WrapperComponent: C) {
    return (props: HighOrderExposedComponentProps<IntlControlContextValue, C>) => {
        return <IntlControlContext.Consumer>
            {value => <WrapperComponent
                locale={value.locale}
                changeLocale={value.changeLocale}
                {...(props as any)} />}
        </IntlControlContext.Consumer>
    }
}